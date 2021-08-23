import {
  Column, FieldType, ForeignKey, RawColumn,
} from '@/components/fields/types'
import { PostgresDataSource } from '@/src/data-sources/postgresql/types'
import { PrismaClient } from '@prisma/client'
import { Views } from '@/components/fields/enums'
import {
  get, isArray, isEmpty,
} from 'lodash'
import { getDataSourceFromRequest } from '@/src/utils/ApiUtils'
import { humanize } from '@/src/utils/humanize'
import { idColumns } from '@/components/fields'
import { withSentry } from '@sentry/nextjs'
import ApiResponse from '@/src/services/ApiResponse'
import IsSignedIn from '@/pages/api/middleware/IsSignedIn'
import OwnsDataSource from '@/pages/api/middleware/OwnsDataSource'
import prisma from '@/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

type IntermediateColumn = {name: string, fieldType: FieldType, dataType: string}

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  switch (req.method) {
    case 'GET':
      return handleGET(req, res)
    case 'PUT':
      return handlePUT(req, res)
    default:
      return res.status(404).send('')
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req) as PostgresDataSource | null

  // If the data source has columns stored, send those in.
  let storedColumns = get(dataSource, ['options', 'tables', req.query.tableName as string, 'columns'])

  if (isArray(storedColumns)) {
    storedColumns = storedColumns.map((column: Column) => hydrateColumns(column))
  }

  if (dataSource?.options?.url) {
    const connection = new PrismaClient({
      datasources: { db: { url: dataSource.options.url } },
    })

    let columns = await getColumns(connection, req.query.tableName as string)
    const primaryKey = await getPrimaryKey(connection, req.query.tableName as string)
    const foreignKeys = await getForeignKeys(connection, req.query.tableName as string)
    const nullableFields = await getNullableFields(connection, req.query.tableName as string)
    const defaultValues = await getDefaultValues(connection, req.query.tableName as string)

    // Disconnect so we don't waste connections
    await connection.$disconnect()

    // return res.json(ApiResponse.withData(defaultValues))

    // Mark the primary key column
    if (!isEmpty(primaryKey)) {
      columns = columns.map((column) => {
        if (primaryKey[0].attname === column.name) {
          return {
            ...column,
            primaryKey: true,
          }
        }

        return column
      })
    }

    // Add the foreign keys to columns
    if (!isEmpty(foreignKeys)) {
      const foreignKeysByColumnName = Object.fromEntries(foreignKeys.map((fk: ForeignKey) => [fk.column_name, fk]))

      columns = columns.map((column) => {
        if (foreignKeysByColumnName[column.name]) {
          return {
            ...column,
            foreignKey: foreignKeysByColumnName[column.name],
          }
        }

        return column
      })
    }

    // Add the foreign keys to columns
    if (!isEmpty(nullableFields)) {
      const nullableFieldsByColumnName = Object.fromEntries(nullableFields.map((field: ForeignKey) => [field.column_name, field]))

      columns = columns.map((column) => {
        if (nullableFieldsByColumnName[column.name]) {
          return {
            ...column,
            nullable: nullableFieldsByColumnName[column.name].nullable === 'is nullable',
          }
        }

        return column
      })
    }

    // Add the default values to columns
    if (!isEmpty(defaultValues)) {
      const defaultValuesByColumnName = Object.fromEntries(defaultValues.map((field: ForeignKey) => [field.column_name, field]))

      columns = columns.map((column) => {
        if (defaultValuesByColumnName[column.name]) {
          return {
            ...column,
            columnDefault: defaultValuesByColumnName[column.name].column_default,
          }
        }

        return column
      })
    }

    if (storedColumns) {
      columns = columns.map((column) => {
        const storedColumn = storedColumns[column.name]

        if (storedColumn) {
          return ({
            ...column,
            ...storedColumn,
          })
        }

        return column
      })
    }

    return res.json(ApiResponse.withData(columns))
  }
  res.status(404).send('')
}

const getDefaultValues = async (connection: PrismaClient, tableName: string) => connection.$queryRaw(`SELECT column_name, column_default
FROM information_schema.columns
WHERE (table_schema, table_name) = ('public', '${tableName}')
ORDER BY ordinal_position;
`)

const getNullableFields = async (connection: PrismaClient, tableName: string) => connection.$queryRaw(`select c.table_schema,
  c.table_name,
  c.column_name,
  case c.is_nullable
       when 'NO' then 'not nullable'
       when 'YES' then 'is nullable'
  end as nullable
from information_schema.columns c
join information_schema.tables t
on c.table_schema = t.table_schema
and c.table_name = t.table_name
where c.table_schema not in ('pg_catalog', 'information_schema')
 and t.table_type = 'BASE TABLE'
 and t.table_name = '${tableName}'
order by table_schema,
    table_name,
    column_name;`)

const getForeignKeys = async (connection: PrismaClient, tableName: string) => connection.$queryRaw(`SELECT
  tc.table_schema,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='${tableName}';`)

const getPrimaryKey = async (connection: PrismaClient, tableName: string) => connection.$queryRaw(`SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS data_type
  FROM   pg_index i
  JOIN   pg_attribute a ON a.attrelid = i.indrelid
                       AND a.attnum = ANY(i.indkey)
  WHERE  i.indrelid = '${tableName}'::regclass
  AND    i.indisprimary;`)

const getColumns = async (connection: PrismaClient, tableName: string): Promise<Column[]> => {
  const columnsInfoResults: RawColumn[] = await connection.$queryRaw(`SELECT
  table_name,
  column_name,
  data_type
FROM
  information_schema.columns
  WHERE
    table_name = '${tableName}';`)

  return columnsInfoResults.map((rawColumn) => hydrateColumns(rawColumnToColumn(rawColumn)))
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req) as PostgresDataSource | null

  if (!req.body.changes) return res.send(ApiResponse.withError('No changes sent.'))

  if (dataSource && req?.query?.tableName) {
    const tableOptions = get(dataSource, ['options', 'tables', req.query.tableName as string, 'columns'])
    const result = await prisma.dataSource.update({
      where: {
        id: parseInt(req.query.dataSourceId as string, 10),
      },
      data: {
        options: {
          ...dataSource.options,
          tables: {
            [req.query.tableName as string]: {
              columns: {
                ...tableOptions,
                ...req.body.changes,
              },
            },
          },
        },
      },
    })

    return res.json(ApiResponse.withData(result, { message: 'Updated' }))
  }

  res.status(404).send('')
}

const rawColumnToColumn = (rawColumn: RawColumn): IntermediateColumn => ({
  name: rawColumn.column_name,
  fieldType: parseFieldType(rawColumn),
  dataType: rawColumn.data_type,
})

const hydrateColumns = (column: Column | IntermediateColumn): Column => ({
  visibility: [Views.index, Views.show, Views.edit, Views.new],
  label: getColumnLabel(column),
  required: 'required' in column && column?.required === true,
  nullable: 'nullable' in column && column?.nullable === true,
  ...column,
})

const getColumnLabel = (column: Column | IntermediateColumn) => {
  if (column.name === 'id') return 'ID'

  return humanize(column.name)
}

const parseFieldType = (column: RawColumn): FieldType => {
  switch (column.data_type) {
    default:
    case 'boolean':
      return 'Boolean'
    case 'timestamp without time zone':
      return 'DateTime'
    case 'character varying':
      return 'Text'
    case 'json':
    case 'text':
      return 'Textarea'
    case 'integer':
    case 'bigint':
      if (idColumns.includes(column.column_name)) return 'Id'

      return 'Number'
  }
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)))

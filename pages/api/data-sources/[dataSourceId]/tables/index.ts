import { PrismaClient } from '@prisma/client'
import { withSentry } from '@sentry/nextjs'
import IsSignedIn from '@/pages/api/middleware/IsSignedIn'
import OwnsDataSource from '@/pages/api/middleware/OwnsDataSource'
import type { NextApiRequest, NextApiResponse } from 'next'
import { PostgresDataSource } from '@/plugins/data-sources/postgresql/types'
import ApiResponse from '@/features/api/ApiResponse'

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  switch (req.method) {
    case 'GET':
      return handleGET(req, res)
    default:
      return res.status(404).send('')
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req) as PostgresDataSource | null

  if (dataSource?.options?.url) {
    const prs = new PrismaClient({
      datasources: { db: { url: dataSource.options.url } },
    })
    const query = `SELECT *
    FROM pg_catalog.pg_tables
    WHERE schemaname != 'pg_catalog' AND
        schemaname != 'information_schema';`
    const getTableInfoQuery = (tables: string[]) => `SELECT
    table_name,
    column_name,
    data_type
  FROM
    information_schema.columns
    WHERE
      table_name
    IN (${tables.map((table) => `'${table}'`).join(',')});
    `

    const rawTables: {tablename: string, schemaname: string}[] = await prs.$queryRaw(query)
    const tablesList = getTableInfoQuery(rawTables.map(({ tablename }) => tablename))

    // eslint-disable-next-line camelcase
    const columnsInfoResults: {table_name: string, column_name: string, data_type: string}[] = await prs.$queryRaw(tablesList)
    const tables: {}[] = []

    const columnsInfo: {[tableName: string]: {name:string, type: string}[]} = {}
    columnsInfoResults.forEach((tableInfo) => {
      if (!columnsInfo[tableInfo.table_name]) columnsInfo[tableInfo.table_name] = []

      const column = {
        name: tableInfo.column_name,
        type: tableInfo.data_type,
      }
      columnsInfo[tableInfo.table_name].push(column)
    })

    rawTables.forEach((tableInfo) => {
      tables.push({
        name: tableInfo.tablename,
        schemaname: tableInfo.schemaname,
      })
    })
    await prs.$disconnect()
    res.json(ApiResponse.withData(tables))
  } else {
    res.status(404).send('')
  }
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)))
function getDataSourceFromRequest(req: NextApiRequest): PostgresDataSource | PromiseLike<PostgresDataSource | null> | null {
  throw new Error('Function not implemented.')
}


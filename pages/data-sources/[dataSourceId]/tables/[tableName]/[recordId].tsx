import {
  Column, Record,
} from '@/components/fields/types'
import { Views } from '@/components/fields/enums'
import { getField } from '@/components/fields/factory'
import { makeField } from '@/components/fields'
import { useGetColumnsQuery } from '@/features/tables/tables-api-slice'
import {
  useGetRecordQuery,
} from '@/features/records/records-api-slice'
import { useRouter } from 'next/router'
import Layout from '@/components/layouts/NewAppLayout'
import Link from 'next/link'
import MenuItem from '@/components/fields/common/MenuItem'
import React, { useMemo } from 'react'
import isArray from 'lodash/isArray'

const RecordShow = ({
  record,
  columns,
}: {
  record: Record;
  columns: Column[];
}) => {
  const router = useRouter()

  return (
    <>
    <div className="flex flex-col">
      <div className="flex justify-end space-x-4">
        <Link href={`/new/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`} passHref>
          <MenuItem>Back</MenuItem>
        </Link>
        <Link href={`/new/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${record.id}/edit`} passHref>
          <MenuItem>Edit</MenuItem>
        </Link>
      </div>
      <div>
        {columns && record
          && columns.map((column: Column) => {
            const field = makeField({ record, column, tableName: router.query.tableName as string })
            const Element = getField(column, Views.show)

            return <Element key={column.name} field={field} />
          })}
      </div>
    </div>
    </>
  )
}

function RecordsShow() {
  const router = useRouter()
  const dataSourceId = router.query.dataSourceId as string
  const tableName = router.query.tableName as string
  const recordId = router.query.recordId as string
  const {
    data, error, isLoading,
  } = useGetRecordQuery({
    dataSourceId,
    tableName,
    recordId,
  }, { skip: !dataSourceId || !tableName || !recordId })

  const { data: columnsResponse } = useGetColumnsQuery({
    dataSourceId,
    tableName,
  }, { skip: !dataSourceId || !tableName })

  const columns = useMemo(() => (isArray(columnsResponse?.data) ? columnsResponse?.data.filter((column: Column) => column?.visibility?.includes(Views.show)) : []
  ), [columnsResponse?.data]) as Column[]

  return (
    <Layout>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && columnsResponse?.ok && (
        <RecordShow record={data.data} columns={columns} />
      )}
      {/* <pre>{JSON.stringify(columnsResponse?.data, null, 2)}</pre> */}
    </Layout>
  )
}

export default RecordsShow

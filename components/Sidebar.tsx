import { memo } from 'react'
import { useGetTablesQuery } from '@/features/tables/tables-api-slice'
import { useRouter } from 'next/router'
import Link from 'next/link'

const Sidebar = () => {
  const router = useRouter()
  const dataSourceId = router.query.dataSourceId as string
  const tableName = router.query.tableName as string
  const { data, error } = useGetTablesQuery(dataSourceId, {skip: !dataSourceId})

  // if (error) {
  //   return (
  //     <div>
  //       failed to load <pre>{JSON.stringify(error, null, 2)}</pre>
  //     </div>
  //   )
  // }
  // if (!data) return <div>loading sidebar...</div>

  // const tables = data.data

  return (
    <>
      <div className="space-y-2">
        <Link href={`/data-sources`}>Home</Link>
      </div>
      {!router.query.dataSourceId && "Select a data source"}
      {/* {tables
        && tables.map((table: { name: string }) => (
          <Link
            key={table.name}
            href={`/new/data-sources/${dataSourceId}/tables/${table.name}`}
          >
            <a className={classNames('block cursor-pointer uppercase text-sm font-bold', { underline: table.name === tableName })}>
              {table.name}
            </a>
          </Link>
        ))} */}
    </>
  )
}

export default memo(Sidebar)

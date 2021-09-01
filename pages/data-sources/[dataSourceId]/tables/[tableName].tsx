import { Column } from "@/features/fields/types";
import { Column as ReactTableColumn } from "react-table";
import { Views } from "@/features/fields/enums";
import { isArray } from "lodash";
import { useBoolean } from "react-use";
import { useGetColumnsQuery } from "@/features/tables/tables-api-slice";
import { useRouter } from "next/router";
import FilterCondition, { Filter, FilterConditions } from "@/components/FilterCondition"
import Layout from "@/components/Layout";
import Link from "next/link";
import MenuItem from "@/features/fields/components/MenuItem";
import React, { memo, useMemo, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";

const parseColumns = (columns: Column[]): ReactTableColumn[] =>
  columns.map((column) => ({
    Header: column.name,
    accessor: column.name,
    meta: {
      ...column,
    },
  }));


const FiltersPanel = memo(({
  columns,
  filters,
  setFilters,
}: {
  columns: Column[];
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
}) => {
  console.log(1);

  const addFilter = () => {
    console.log("addFilter");
    const filter: Filter = {
      columnName: columns[0].name,
      columnLabel: columns[0].label,
      verb: filters.length === 0 ? "where" : "and",
      condition: FilterConditions.contains,
      value: "",
    };

    setFilters([...filters, filter]);
  };

  const updateFilter = (idx: number, filter: Filter) => {
    const newFilters = [...filters]
    newFilters.splice(idx, 1)
    newFilters[idx] = filter
    setFilters(newFilters)
  }

  return (
    <div className="absolute border shadow-lg bg-white z-20 min-w-full min-h-[6rem] mt-4">
      <pre>{JSON.stringify(filters, null, 2)}</pre>
      {filters &&
        filters.map((filter, idx) => (
          <FilterCondition
            key={idx}
            idx={idx}
            columns={columns}
            filter={filter}
            filters={filters}
            onChange={(filter: Filter) => updateFilter(idx, filter)}
          />
        ))}
      <MenuItem onClick={addFilter}>Add filter</MenuItem>
    </div>
  );
});

FiltersPanel.displayName = 'FiltersPanel'

const ResourcesEditor = memo(
  ({
    dataSourceId,
    tableName,
    columns,
  }: {
    dataSourceId: string;
    tableName: string;
    columns: Column[];
  }) => {
    const parsedColumns = parseColumns(columns);
    const router = useRouter();
    const [filtersPanelVisible, toggleFiltersPanelVisible] = useBoolean(false);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [orderBy, setOrderBy] = useState('');
    const [orderDirection, setOrderDirection] = useState<'' | 'asc' | 'desc'>('');

    return (
      <>
        {/* {!isLoading && data?.ok && ( */}
        <>
          <div className="relative flex flex-col flex-1 overflow-auto">
            <div className="flex justify-between w-full">
              {filtersPanelVisible && (
                <FiltersPanel
                  columns={columns}
                  filters={filters}
                  setFilters={setFilters}
                />
              )}
              <div className="flex space-x-4">
                <MenuItem onClick={() => toggleFiltersPanelVisible()}>
                  Filter
                </MenuItem>
              </div>
              <div className="flex space-x-4">
                <Link
                  href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/edit`}
                  passHref
                >
                  <MenuItem>Edit columns</MenuItem>
                </Link>
                <Link
                  href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/new`}
                  passHref
                >
                  <MenuItem>Create</MenuItem>
                </Link>
              </div>
            </div>
            <div className="relative flex-1 max-w-full w-full">
              <RecordsTable
                columns={parsedColumns}
                filters={filters}
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                orderDirection={orderDirection}
                setOrderDirection={setOrderDirection}
                // data={data?.data}
                tableName={tableName}
                dataSourceId={dataSourceId}
              />
            </div>
          </div>
        </>
        {/* )} */}
      </>
    );
  }
);

ResourcesEditor.displayName = "ResourcesEditor";

function TablesShow() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const {
    data: columnsResponse,
    error,
    isLoading,
  } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const columns = useMemo(
    () =>
      isArray(columnsResponse?.data)
        ? columnsResponse?.data.filter((column: Column) =>
            column?.baseOptions.visibility?.includes(Views.index)
          )
        : [],
    [columnsResponse?.data]
  ) as Column[];

  return (
    <Layout>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && columnsResponse?.ok && (
        <ResourcesEditor
          tableName={tableName}
          columns={columns}
          dataSourceId={dataSourceId}
        />
      )}
    </Layout>
  );
}

export default memo(TablesShow)

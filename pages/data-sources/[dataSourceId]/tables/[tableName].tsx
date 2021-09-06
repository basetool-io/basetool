import { Button, ButtonGroup } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import {
  FilterIcon,
  PencilAltIcon,
  PlusIcon,
  XIcon,
} from "@heroicons/react/outline";
import { OrderDirection } from "@/features/tables/types";
import { Column as ReactTableColumn } from "react-table";
import { Views } from "@/features/fields/enums";
import { isArray, isEmpty } from "lodash";
import { useBoolean, useClickAway } from "react-use";
import { useFilters } from "@/hooks";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/features/records/components/PageWrapper";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";

const parseColumns = (columns: Column[]): ReactTableColumn[] =>
  columns.map((column) => ({
    Header: column.name,
    accessor: column.name,
    meta: {
      ...column,
    },
  }));

const ResourcesIndex = memo(
  ({
    dataSourceId,
    tableName,
    columns,
  }: {
    dataSourceId: string;
    tableName: string;
    columns: Column[];
  }) => {
    const router = useRouter();
    const parsedColumns = parseColumns(columns);
    const [orderBy, setOrderBy] = useState(router.query.orderBy as string);
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
      router.query.orderDirection as OrderDirection
    );
    const [filtersPanelVisible, toggleFiltersPanelVisible] = useBoolean(false);
    const { appliedFilters, resetFilters } = useFilters();

    useEffect(() => {
      resetFilters();
    }, [tableName]);

    const filtersButton = useRef(null);
    const filtersPanel = useRef(null);
    useClickAway(filtersPanel, (e) => {
      // When a user click the filters button to close the filters panel, the button is still outside,
      // so the action triggers twice closing and opening the filters panel.
      if (e.target !== filtersButton.current) {
        toggleFiltersPanelVisible(false);
      }
    });

    return (
      <PageWrapper
        heading="Browse records"
        flush={true}
        buttons={
          <>
            <ButtonGroup size="sm">
              <Link
                href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/edit`}
                passHref
              >
                <Button
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<PencilAltIcon className="h-4" />}
                >
                  Edit columns
                </Button>
              </Link>
              <Link
                href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/new`}
                passHref
              >
                <Button
                  colorScheme="blue"
                  leftIcon={<PlusIcon className="h-4" />}
                >
                  Create record
                </Button>
              </Link>
            </ButtonGroup>
          </>
        }
      >
        {/* {!isLoading && data?.ok && ( */}
        <>
          <div className="relative flex flex-col flex-1 w-full h-full">
            <div className="relative flex justify-between w-full py-2 px-2 bg-white shadow z-20">
              {filtersPanelVisible && (
                <FiltersPanel ref={filtersPanel} columns={columns} />
              )}
              <div className="flex flex-shrink-0">
                <Button
                  onClick={() => toggleFiltersPanelVisible()}
                  variant="link"
                  ref={filtersButton}
                >
                  <FilterIcon className="h-4 inline mr-1" /> Filters{" "}
                </Button>
                <div className="text-sm text-gray-600">
                  {!isEmpty(appliedFilters) && (
                    <div>
                      ({appliedFilters.length} applied){" "}
                      <Button size="xs" onClick={resetFilters}>
                        <XIcon className="h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="relative flex-1 flex h-full max-w-full w-full">
              <RecordsTable
                columns={parsedColumns}
                // filters={filters}
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
      </PageWrapper>
    );
  }
);

ResourcesIndex.displayName = "ResourcesIndex";

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
      {isLoading && (
        <LoadingOverlay transparent={isEmpty(columnsResponse?.data)} />
      )}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && columnsResponse?.ok && (
        <ResourcesIndex
          tableName={tableName}
          columns={columns}
          dataSourceId={dataSourceId}
        />
      )}
    </Layout>
  );
}

export default memo(TablesShow);

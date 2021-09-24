import { Button, ButtonGroup, Checkbox, Tooltip } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import {
  FilterIcon,
  PencilAltIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@heroicons/react/outline";
import { OWNER_ROLE } from "@/features/roles";
import { OrderDirection } from "@/features/tables/types";
import { Row } from "react-table";
import { Views } from "@/features/fields/enums";
import { isArray, isEmpty } from "lodash";
import { parseColumns } from "@/features/tables";
import { useAccessControl, useFilters, useSelectRecords } from "@/hooks";
import { useBoolean, useClickAway } from "react-use";
import { useDeleteBulkRecordsMutation } from "@/features/records/api-slice";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import ErrorWrapper from "@/components/ErrorWrapper";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";

const CheckboxColumnCell = ({ row }: { row: Row<any>}) => {
  const { selectedRecords, toggleRecordSelection } = useSelectRecords();

  return (
    <div className="flex items-center justify-center h-full">
      <Checkbox
        colorScheme="gray"
        isChecked={selectedRecords.includes(row?.original?.id)}
        onChange={(e) => toggleRecordSelection(row?.original?.id)}
      />
    </div>
  );
};

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
    const checkboxColumn = {
      Header: 'record_selector',
      accessor: (row: any, i: number) => `record_selector_${i}`,
      Cell: CheckboxColumnCell,
      width: 70,
      minWidth: 70,
      maxWidth: 70,
    };
    const parsedColumns = [
      checkboxColumn,
      ...parseColumns({ dataSourceId, columns, tableName }),
    ];
    const [orderBy, setOrderBy] = useState(router.query.orderBy as string);
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
      router.query.orderDirection as OrderDirection
    );
    const [filtersPanelVisible, toggleFiltersPanelVisible] = useBoolean(false);
    const { appliedFilters, resetFilters } = useFilters();
    const ac = useAccessControl();

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

    const { selectedRecords } = useSelectRecords();
    const [deleteBulkRecords, { isLoading: isDeleting }] =
      useDeleteBulkRecordsMutation();

    const handleDeleteMultiple = async () => {
      const confirmed = confirm(
        "Are you sure you want to remove " +
          selectedRecords.length +
          " record(s)?"
      );
      if (confirmed) {
        await deleteBulkRecords({
          dataSourceId: router.query.dataSourceId as string,
          tableName: router.query.tableName as string,
          recordIds: selectedRecords as number[],
        });
      }
    };

    return (
      <PageWrapper
        heading="Browse records"
        flush={true}
        buttons={
          <>
            <ButtonGroup size="sm">
              {ac.hasRole(OWNER_ROLE) && (
                <>
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
                </>
              )}
              {ac.deleteAny("record").granted && (
                <>
                  <Tooltip
                    label={"Delete " + selectedRecords.length + " record(s)"}
                    placement="bottom"
                    gutter={10}
                  >
                    <Button
                      colorScheme="red"
                      variant="outline"
                      isLoading={isDeleting}
                      isDisabled={selectedRecords.length == 0}
                      onClick={handleDeleteMultiple}
                    >
                      <TrashIcon className="h-4" />
                    </Button>
                  </Tooltip>
                </>
              )}
              {ac.createAny("record").granted && (
                <>
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
                </>
              )}
            </ButtonGroup>
          </>
        }
      >
        <>
          <div className="relative flex flex-col flex-1 w-full h-full">
            <div className="relative flex justify-between w-full py-2 px-2 bg-white shadow z-20 rounded">
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
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                orderDirection={orderDirection}
                setOrderDirection={setOrderDirection}
                tableName={tableName}
                dataSourceId={dataSourceId}
              />
            </div>
          </div>
        </>
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
        <LoadingOverlay
          inPageWrapper
          transparent={isEmpty(columnsResponse?.data)}
        />
      )}
      {error && <ErrorWrapper error={error} />}
      {!isLoading && !error && columnsResponse?.ok && (
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

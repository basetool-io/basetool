import {
  Button,
  ButtonGroup,
  Checkbox,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
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
import { getFilteredColumns } from "@/features/fields";
import { isEmpty } from "lodash";
import { parseColumns } from "@/features/tables";
import { useAccessControl, useFilters, useSelectRecords } from "@/hooks";
import { useBoolean, useClickAway } from "react-use";
import { useDeleteBulkRecordsMutation } from "@/features/records/api-slice";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import ErrorWrapper from "@/components/ErrorWrapper";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import ItemControls from "@/features/tables/components/ItemControls";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";
import pluralize from "pluralize";

const CheckboxColumnCell = ({ row }: { row: Row<any> }) => {
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

const SelectorColumnCell = ({ row }: { row: Row<any> }) => (
  <div className="flex items-center justify-center h-full">
    <ItemControls recordId={row?.original?.id} />
  </div>
);

function TablesShow() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );
  const {
    data: columnsResponse,
    error,
    isLoading,
  } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    {
      skip: !dataSourceId || !tableName,
    }
  );

  const columns = useMemo(
    () => getFilteredColumns(columnsResponse?.data, Views.index),
    [columnsResponse?.data]
  );

  const checkboxColumn = {
    Header: "selector_column",
    accessor: (row: any, i: number) => `selector_column_${i}`,
    Cell: CheckboxColumnCell,
    width: 70,
    minWidth: 70,
    maxWidth: 70,
  };

  const controlsColumn = {
    Header: "controls_column",
    accessor: (row: any, i: number) => `controls_column_${i}`,
    // eslint-disable-next-line react/display-name
    Cell: (row: any) => <SelectorColumnCell row={row.row} />,
    width: 104,
    minWidth: 104,
    maxWidth: 104,
  };

  const parsedColumns = [
    checkboxColumn,
    ...parseColumns({ dataSourceId, columns, tableName }),
    controlsColumn,
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

  const deleteMessage = useMemo(
    () =>
      `Delete ${selectedRecords.length} ${pluralize(
        "record",
        selectedRecords.length
      )}`,
    [selectedRecords.length]
  );

  return (
    <Layout>
      {isLoading && (
        <LoadingOverlay
          inPageWrapper
          transparent={isEmpty(columnsResponse?.data)}
        />
      )}
      {error && <ErrorWrapper error={error} />}
      <PageWrapper
        heading="Browse records"
        flush={true}
        buttons={
          <ButtonGroup size="xs">
            {ac.hasRole(OWNER_ROLE) &&
              !dataSourceResponse?.meta?.dataSourceInfo?.readOnly && (
                <Link
                  href={`/data-sources/${router.query.dataSourceId}/edit/tables/${router.query.tableName}/columns`}
                  passHref
                >
                  <Button
                    colorScheme="blue"
                    variant="ghost"
                    leftIcon={<PencilAltIcon className="h-4" />}
                  >
                    Edit columns
                  </Button>
                </Link>
              )}
          </ButtonGroup>
        }
        footer={
          <PageWrapper.Footer
            left={
              ac.deleteAny("record").granted && (
                <Tooltip label={deleteMessage} placement="bottom" gutter={10}>
                  <Button
                    className="text-red-600 text-sm cursor-pointer"
                    variant="link"
                    colorScheme="red"
                    leftIcon={<TrashIcon className="h-4" />}
                    isLoading={isDeleting}
                    isDisabled={selectedRecords.length === 0}
                    onClick={handleDeleteMultiple}
                  >
                    {selectedRecords.length > 0 &&
                      `Delete ${selectedRecords.length} ${pluralize(
                        "record",
                        selectedRecords.length
                      )}`}
                    {/* Add empty space 👇 so the icon doesn't get offset to the left when "Delete records" is displayed */}
                    {selectedRecords.length === 0 && (
                      <>&nbsp;&nbsp;&nbsp;&nbsp;</>
                    )}
                  </Button>
                </Tooltip>
              )
            }
            center={
              ac.createAny("record").granted && (
                <Link
                  href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/new`}
                  passHref
                >
                  <Button
                    as="a"
                    colorScheme="blue"
                    size="sm"
                    width="300px"
                    leftIcon={<PlusIcon className="h-4" />}
                  >
                    Create record
                  </Button>
                </Link>
              )
            }
          />
        }
      >
        <div className="relative flex flex-col flex-1 w-full h-full">
          <div className="relative flex justify-between w-full py-2 px-2 bg-white shadow z-20 rounded">
            {filtersPanelVisible && (
              <FiltersPanel ref={filtersPanel} columns={columns} />
            )}
            <div className="flex flex-shrink-0">
              <ButtonGroup
                size="xs"
                variant="outline"
                isAttached
              >
                <Button
                  onClick={() => toggleFiltersPanelVisible()}
                  ref={filtersButton}
                  leftIcon={<FilterIcon className="h-3 text-gray-600" />}
                >
                  <div className="text-gray-800">Filters</div>
                  {!isEmpty(appliedFilters) && (
                    <>
                      <div className="text-gray-600 font-thin mr-1 ml-1">|</div>
                      <div className="text-blue-600 font-thin">
                        {appliedFilters.length}
                      </div>
                    </>
                  )}
                </Button>
                {!isEmpty(appliedFilters) && (
                  <Tooltip label="Reset filters">
                    <IconButton
                      aria-label="Remove filters"
                      icon={<XIcon className="h-3" />}
                      onClick={resetFilters}
                    />
                  </Tooltip>
                )}
              </ButtonGroup>
            </div>
          </div>
          <div className="relative flex-1 flex h-full max-w-full w-full">
            {dataSourceId && (
              <RecordsTable
                columns={parsedColumns}
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                orderDirection={orderDirection}
                setOrderDirection={setOrderDirection}
                tableName={tableName}
                dataSourceId={dataSourceId}
              />
            )}
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default memo(TablesShow);

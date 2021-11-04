import { Button, ButtonGroup, IconButton, Tooltip } from "@chakra-ui/react";
import {
  FilterIcon,
  PencilAltIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@heroicons/react/outline";
import { IFilter, IFilterGroup } from "@/features/tables/types";
import { OWNER_ROLE } from "@/features/roles";
import { columnsSelector } from "../state-slice";
import { isEmpty, isUndefined } from "lodash";
import { useAccessControl, useAppSelector, useDataSourceContext } from "@/hooks";
import { useBoolean, useClickAway } from "react-use";
import { useDeleteBulkRecordsMutation } from "@/features/records/api-slice";
import {
  useFilters,
  useOrderRecords,
  usePagination,
  useSelectRecords,
} from "../hooks";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetViewQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import Layout from "@/components/Layout";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useEffect, useMemo, useRef } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";
import pluralize from "pluralize";

const RecordsIndex = () => {
  const router = useRouter();
  const { viewId, tableName, dataSourceId, newRecordPath } =
    useDataSourceContext();
  const { data: viewResponse } = useGetViewQuery({ viewId }, { skip: !viewId });
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const filters = useMemo(
    () => viewResponse?.data?.filters || [],
    [viewResponse]
  );

  const [filtersPanelVisible, toggleFiltersPanelVisible] = useBoolean(false);
  const {
    appliedFilters,
    appliedNonBaseFilters,
    setFilters,
    setAppliedFilters,
    removeFilter,
  } = useFilters(filters);
  const ac = useAccessControl();
  const { setOrderBy, setOrderDirection } = useOrderRecords();
  const { setPage } = usePagination();

  const setViewData = () => {
    if (viewResponse?.ok) {
      if (viewResponse.data.filters) {
        setFilters(viewResponse.data.filters);
        setAppliedFilters(viewResponse.data.filters);
      }

      // We have to check whether there is a default order on the view and the order from the query to be empty.
      if (
        viewResponse.data.defaultOrder &&
        !isEmpty(viewResponse.data.defaultOrder) &&
        isUndefined(router.query.orderBy) &&
        isUndefined(router.query.orderDirection)
      ) {
        setOrderBy(viewResponse.data.defaultOrder.columnName);
        setOrderDirection(viewResponse.data.defaultOrder.direction);
      }
    }
  };

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
        dataSourceId,
        tableName,
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

  const resetNonBaseFilters = () => {
    appliedFilters.forEach((filter: IFilter | IFilterGroup, idx: number) => {
      if (!filter.isBase) {
        removeFilter(idx);
      }
    });
  };

  // Set the view data if we have any
  useEffect(() => {
    if (viewId) {
      setViewData();
    }
  }, [tableName, viewId, viewResponse]);

  // Set the view data if we have any
  useEffect(() => {
    if (viewId) {
      setViewData();
    }
  }, []);

  useEffect(() => {
    if (router.query.page) {
      setPage(parseInt(router.query.page as string));
    }
  }, [router.query.page]);

  // We need to find out if it has Id column for the visibility of delete bulk and create buttons (footer).
  const rawColumns = useAppSelector(columnsSelector);
  const hasIdColumn = useMemo(() => rawColumns.find((col) => col.name === "id"), [rawColumns]);

  return (
    <Layout>
      <PageWrapper
        heading="Browse records"
        flush={true}
        buttons={
          <ButtonGroup size="xs">
            {!viewId &&
              ac.hasRole(OWNER_ROLE) &&
              !dataSourceResponse?.meta?.dataSourceInfo?.readOnly && (
                <Link
                  href={`/data-sources/${dataSourceId}/edit/tables/${tableName}/columns`}
                  passHref
                >
                  <Button
                    as="a"
                    colorScheme="blue"
                    variant="ghost"
                    leftIcon={<PencilAltIcon className="h-4" />}
                  >
                    Edit columns
                  </Button>
                </Link>
              )}
            {viewId && ac.hasRole(OWNER_ROLE) && (
              <Link href={`/views/${viewId}/edit`} passHref>
                <Button
                  as="a"
                  colorScheme="blue"
                  variant="ghost"
                  leftIcon={<PencilAltIcon className="h-4" />}
                >
                  Edit view
                </Button>
              </Link>
            )}
          </ButtonGroup>
        }
        footer={
          hasIdColumn &&
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
                    {/* Add empty space 👇 so the icon doesn't get offset to the left when "Delete records" label is displayed */}
                    {selectedRecords.length === 0 && (
                      <>&nbsp;&nbsp;&nbsp;&nbsp;</>
                    )}
                  </Button>
                </Tooltip>
              )
            }
            center={
              ac.createAny("record").granted &&
              !dataSourceResponse?.meta?.dataSourceInfo?.readOnly && (
                <Link href={newRecordPath} passHref>
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
          <div className="relative flex justify-end w-full py-2 px-2 bg-white shadow z-20 rounded">
            {filtersPanelVisible && <FiltersPanel ref={filtersPanel} />}
            <div className="flex flex-shrink-0">
              {dataSourceResponse?.ok &&
                dataSourceResponse?.meta?.dataSourceInfo?.supports?.filters && (
                  <ButtonGroup size="xs" variant="outline" isAttached>
                    <Button
                      onClick={() => toggleFiltersPanelVisible()}
                      ref={filtersButton}
                      leftIcon={<FilterIcon className="h-3 text-gray-600" />}
                    >
                      <div className="text-gray-800">Filters</div>
                      {!isEmpty(appliedFilters) && (
                        <>
                          <div className="text-gray-600 font-thin mr-1 ml-1">
                            |
                          </div>
                          <div className="text-blue-600 font-thin">
                            {appliedFilters.length}
                          </div>
                        </>
                      )}
                    </Button>
                    {!isEmpty(appliedNonBaseFilters) && (
                      <Tooltip label="Reset filters">
                        <IconButton
                          aria-label="Remove filters"
                          icon={<XIcon className="h-3" />}
                          onClick={resetNonBaseFilters}
                        />
                      </Tooltip>
                    )}
                  </ButtonGroup>
                )}
            </div>
          </div>
          <div className="relative flex-1 flex h-full max-w-full w-full">
            {dataSourceId && <RecordsTable />}
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default memo(RecordsIndex);

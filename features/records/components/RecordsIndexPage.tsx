import { Button, ButtonGroup } from "@chakra-ui/react";
import { OWNER_ROLE } from "@/features/roles";
import { PencilAltIcon, PlusIcon } from "@heroicons/react/outline";
import { columnsSelector } from "../state-slice";
import { humanize } from "@/lib/humanize";
import {
  useAccessControl,
  useAppSelector,
  useDataSourceContext,
} from "@/hooks";
import { useBoolean, useClickAway } from "react-use";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetViewQuery } from "@/features/views/api-slice";
import BulkDeleteButton from "@/features/tables/components/BulkDeleteButton";
import CursorPagination from "@/features/tables/components/CursorPagination";
import FiltersButton from "@/features/tables/components/FiltersButton";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import OffsetPagination from "@/features/tables/components/OffsetPagination";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useMemo, useRef } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";

const RecordsIndexPage = ({
  error,
  isFetching,
}: {
  error?: string;
  isFetching?: boolean;
}) => {
  const ac = useAccessControl();
  const { viewId, tableName, dataSourceId, newRecordPath } =
    useDataSourceContext();
  const { data: viewResponse } = useGetViewQuery({ viewId }, { skip: !viewId });
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    { skip: !dataSourceId }
  );

  const filtersButton = useRef(null);
  const filtersPanel = useRef(null);

  useClickAway(filtersPanel, (e) => {
    // When a user click the filters button to close the filters panel, the button is still outside,
    // so the action triggers twice closing and opening the filters panel.
    if (
      filtersButton?.current &&
      !(filtersButton?.current as any)?.contains(e.target)
    ) {
      toggleFiltersPanelVisible(false);
    }
  });

  // We need to find out if it has Id column for the visibility of delete bulk and create buttons (footer).
  const rawColumns = useAppSelector(columnsSelector);
  const hasIdColumn = useMemo(
    () => rawColumns.find((col) => col.name === "id"),
    [rawColumns]
  );

  const headingText = useMemo(() => {
    if (viewId && viewResponse?.ok) {
      return viewResponse?.data.name;
    } else if (tableName) {
      return humanize(tableName);
    } else {
      return "Browse records";
    }
  }, [viewId, viewResponse, tableName]);

  const [filtersPanelVisible, toggleFiltersPanelVisible] = useBoolean(false);

  const PaginationComponent = useMemo(() => {
    switch (dataSourceResponse?.meta?.dataSourceInfo?.pagination) {
      default:
      case "offset":
        return OffsetPagination;
      case "cursor":
        return CursorPagination;
    }
  }, [dataSourceResponse?.meta?.dataSourceInfo?.pagination]);

  return (
    <Layout>
      <PageWrapper
        heading={headingText}
        flush={true}
        buttons={
          <ButtonGroup size="xs">
            {!viewId &&
              ac.hasRole(OWNER_ROLE) &&
              !dataSourceResponse?.meta?.dataSourceInfo?.readOnly && (
                <Link
                  href={`/views/new?dataSourceId=${dataSourceId}&tableName=${tableName}`}
                  passHref
                >
                  <Button
                    as="a"
                    colorScheme="blue"
                    variant="ghost"
                    leftIcon={<PlusIcon className="h-4" />}
                  >
                    Create view from this table
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
          hasIdColumn && (
            <PageWrapper.Footer
              left={ac.deleteAny("record").granted && <BulkDeleteButton />}
              center={
                ac.createAny("record").granted &&
                !dataSourceResponse?.meta?.dataSourceInfo?.readOnly &&
                newRecordPath && (
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
          )
        }
      >
        <div className="relative flex flex-col flex-1 w-full h-full">
          <div className="relative flex justify-end w-full py-2 px-2 bg-white shadow z-20 rounded">
            {filtersPanelVisible && <FiltersPanel ref={filtersPanel} />}
            <div className="flex flex-shrink-0">
              {dataSourceResponse?.ok &&
                dataSourceResponse?.meta?.dataSourceInfo?.supports?.filters && (
                  <FiltersButton
                    filtersButtonRef={filtersButton}
                    toggleFiltersPanelVisible={toggleFiltersPanelVisible}
                  />
                )}
            </div>
          </div>
          <div className="relative flex-1 flex h-full max-w-full w-full">
            {dataSourceId && (
              <div className="flex-1 flex flex-col justify-between w-full">
                {isFetching && (
                  <div className="flex-1 flex">
                    <LoadingOverlay label="Fetching records" transparent />
                  </div>
                )}
                {!isFetching && (
                  <>
                    <div className="flex-1 flex overflow-x-auto w-full">
                      <RecordsTable error={error} />
                    </div>
                    <PaginationComponent />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default memo(RecordsIndexPage);

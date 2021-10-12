import { FooterElements } from "@/types";
import { INITIAL_NEW_COLUMN } from "@/pages/data-sources/[dataSourceId]/edit/tables/[tableName]/columns/[columnName]";
import { PlusIcon } from "@heroicons/react/outline";
import { getColumnNameLabel, iconForField } from "@/features/fields";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSegment } from "@/hooks";
import ColumnListItem from "@/components/ColumnListItem";
import DataSourcesEditLayout from "@/features/data-sources/components/DataSourcesEditLayout";
import React, { ReactElement } from "react";
import classNames from "classnames";

const TableColumnsEditLayout = ({
  dataSourceId,
  backLink,
  crumbs,
  isLoading = false,
  footerElements,
  children,
}: {
  dataSourceId?: string;
  backLink?: string;
  crumbs?: string[];
  isLoading?: boolean;
  footerElements?: FooterElements;
  children?: ReactElement;
}) => {
  const router = useRouter();
  dataSourceId ||= router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;

  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const track = useSegment("Visited edit columns page", {
    page: "edit columns",
  });

  return (
    <DataSourcesEditLayout
      backLink={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`}
      backLabel="Back to table"
      crumbs={
        crumbs || [dataSourceResponse?.data.name, "Edit", tableName, "Columns"]
      }
      isLoading={isLoading}
      footerElements={footerElements}
    >
      <>
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r">
            <div className="w-full relative p-4">
              <div className="mb-2 font-semibold text-gray-500">Fields</div>
              {columnsResponse?.ok &&
                columnsResponse.data.map((col: any) => {
                  const IconElement = iconForField(col);

                  return (
                    <ColumnListItem
                      key={col.name}
                      icon={
                        <IconElement className="h-4 mr-2 flex flex-shrink-0" />
                      }
                      href={`/data-sources/${dataSourceId}/edit/tables/${tableName}/columns/${col.name}`}
                      active={col.name === router.query.columnName}
                      onClick={() => track("Selected column in edit columns")}
                    >
                      <div
                        className={classNames({
                          "font-mono": col?.baseOptions?.computed === true,
                        })}
                      >
                        {getColumnNameLabel(
                          col.baseOptions.label,
                          col.label,
                          col.name
                        )}{" "}
                        {col.baseOptions.required && (
                          <sup className="text-red-600">*</sup>
                        )}
                      </div>
                    </ColumnListItem>
                  );
                })}
              <div className="mt-2">
                <ColumnListItem
                  icon={<PlusIcon className="h-4 mr-2 flex flex-shrink-0" />}
                  href={`/data-sources/${dataSourceId}/edit/tables/${tableName}/columns/${INITIAL_NEW_COLUMN.name}`}
                  active={INITIAL_NEW_COLUMN.name === router.query.columnName}
                  onClick={() => track("Add column in edit columns")}
                >
                  Add new field
                </ColumnListItem>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4">
            {children && children}
            {!children && (
              <div className="flex-1 p-4">
                👈 Select a column to start editing
              </div>
            )}
          </div>
        </div>
      </>
    </DataSourcesEditLayout>
  );
};

export default TableColumnsEditLayout;

import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { getLabel } from "@/features/data-sources";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import ColumnListItem from "@/components/ColumnListItem";
import LoadingOverlay from "@/components/LoadingOverlay";
import React, { memo } from "react";

const DataSourceEditSidebar = ({ dataSourceId }: { dataSourceId?: string }) => {
  const router = useRouter();
  dataSourceId ||= router.query.dataSourceId as string;
  const { data, isLoading } = useGetTablesQuery(
    {
      dataSourceId,
    },
    { skip: !dataSourceId }
  );

  return (
    <div className="w-full relative p-4">
      <div className="relative flex-1 mb-2 font-semibold text-gray-500">Tables</div>
      {isLoading && (
        <div className="flex-1 min-h-full">
          <LoadingOverlay transparent={true} subTitle={false} />
        </div>
      )}
      {data?.ok &&
        data?.data.map((table: ListTable) => {
          return (
            <ColumnListItem
              key={table.name}
              active={table.name === router.query.tableName}
              href={`/data-sources/${dataSourceId}/edit/tables/${table.name}`}
            >
              {getLabel(table)}
            </ColumnListItem>
          );
        })}
    </div>
  );
};

export default memo(DataSourceEditSidebar);

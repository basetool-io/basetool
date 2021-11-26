import { useDataSourceContext } from "@/hooks";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useViewResponse } from "../hooks"
import React from "react";
import Shimmer from "@/components/Shimmer";
import TinyLabel from "@/components/TinyLabel";

function ViewEditDataSourceInfo() {
  const { viewId, dataSourceId } = useDataSourceContext();
  const { view, isLoading: viewIsLoading } = useViewResponse(viewId);
  const { data: dsResponse, isLoading: dsIsLoading } = useGetDataSourceQuery(
    { dataSourceId },
    { skip: !dataSourceId }
  );

  return (
    <div className="grid space-y-4 lg:space-y-0 lg:grid-cols-2">
      <div>
        <TinyLabel className="mr-1">DataSource</TinyLabel>
        <div className="text-sm flex-1">
          {dsIsLoading && (
            <Shimmer height="14px" width="70px" className="mt-1" />
          )}
          {!dsIsLoading && dsResponse?.data?.name}
        </div>
      </div>
      <div>
        <TinyLabel>Table name</TinyLabel>
        <div className="text-sm flex-1">
          {viewIsLoading && (
            <Shimmer height="14px" width="70px" className="mt-1" />
          )}
          {!viewIsLoading && view?.tableName}
        </div>
      </div>
    </div>
  );
}

export default ViewEditDataSourceInfo;

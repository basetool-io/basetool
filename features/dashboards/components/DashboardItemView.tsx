import { DashboardItem } from "@prisma/client";
import React, { useMemo } from "react";
import Shimmer from "@/components/Shimmer";

export type DashboardItemOptions = {
  prefix: string;
  suffix: string;
};

function DashboardItemView({
  dashboardItem,
  isLoading = false,
  value = "",
}: {
  dashboardItem: DashboardItem;
  isLoading: boolean;
  value?: string;
}) {
  const options = useMemo(
    () => dashboardItem?.options as DashboardItemOptions,
    [dashboardItem.options]
  );

  const prefix = useMemo(() => options.prefix || "", [options]);
  const suffix = useMemo(() => options.suffix || "", [options]);

  const displayValue = useMemo(() => parseFloat(value), [value]);

  return (
    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
      <dt className="text-sm font-medium text-gray-500 truncate">
        {dashboardItem.name}
      </dt>
      {isLoading && (
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          <Shimmer height="36px" width="200px" className="inline-block" />
        </dd>
      )}
      {!isLoading && (
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          {prefix} {displayValue} {suffix}
        </dd>
      )}
    </div>
  );
}

export default DashboardItemView;

import { DashboardItem } from "@prisma/client";
import React, { useMemo } from "react";

function DashboardItemView({
  dashboardItem,
}: {
  dashboardItem: DashboardItem;
}) {

  const prefix = useMemo(() => dashboardItem?.options?.prefix || "", [dashboardItem.options]);
  const suffix = useMemo(() => dashboardItem?.options?.suffix || "", [dashboardItem.options]);

  return (
    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
      <dt className="text-sm font-medium text-gray-500 truncate">{dashboardItem.name}</dt>
      <dd className="mt-1 text-3xl font-semibold text-gray-900">{prefix} 125 {suffix}</dd>
    </div>
  );
}

export default DashboardItemView;

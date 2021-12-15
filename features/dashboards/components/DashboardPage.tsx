import { Widget as IWidget } from "@prisma/client";
import { Link } from "@chakra-ui/react";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetWidgetsValuesQuery } from "../api-slice";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import Widget from "./Widget";

function DashboardPage() {
  const router = useRouter();
  const { dashboardId } = useDataSourceContext();

  const { isLoading: dashboardIsLoading, widgets } =
    useDashboardResponse(dashboardId);

  useGetWidgetsValuesQuery({ dashboardId }, { skip: !dashboardId });

  const isEditPage = useMemo(
    () => router.pathname.includes("/edit"),
    [router.pathname]
  );

  return (
    <div className="relative flex flex-col flex-1 w-full h-full p-2">
      {!dashboardIsLoading && widgets.length === 0 && (
        <div className="flex flex-1 flex-col justify-center items-center text-lg font-semibold text-gray-600 h-full">
          No widgets{" "}
          {!isEditPage && (
            <Link href={`/dashboards/${dashboardId}/edit`}>
              <a className="text-blue-600 text-md underline">Add a widget</a>
            </Link>
          )}
        </div>
      )}
      {!dashboardIsLoading && widgets.length > 0 && (
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {widgets.map((widget: IWidget, idx: number) => (
            <Widget key={idx} widget={widget} />
          ))}
        </dl>
      )}
    </div>
  );
}

export default DashboardPage;

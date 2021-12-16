import { Dashboard, View } from "@prisma/client";
import { DataSourceOptions } from "../types";
import { Select } from "@chakra-ui/react";
import { useDataSourceContext, useProfile } from "@/hooks";
import { useDataSourceResponse } from "../hooks";
import { useGetDashboardsQuery } from "@/features/dashboards/api-slice";
import { useGetViewsQuery } from "@/features/views/api-slice";
import { useUpdateDataSourceMutation } from "@/features/data-sources/api-slice";
import React, { useMemo } from "react";
import TinyLabel from "@/components/TinyLabel";

function DataSourceEditHomepage() {
  const { dataSourceId } = useDataSourceContext();
  const { user, isLoading: sessionIsLoading } = useProfile();

  const { dataSource, isLoading: dataSourceIsLoading } =
    useDataSourceResponse(dataSourceId);

  const { data: dashboardsResponse, isLoading: dashboardsAreLoading } =
    useGetDashboardsQuery({ dataSourceId }, { skip: !dataSourceId });

  const dashboards = useMemo(
    () => (dashboardsResponse?.ok ? dashboardsResponse?.data : []),
    [dashboardsResponse]
  );

  const { data: viewsResponse, isLoading: viewsAreLoading } =
    useGetViewsQuery();

  const views = useMemo(
    () => (viewsResponse?.ok ? viewsResponse.data : []),
    [viewsResponse]
  );

  const filteredViews = useMemo(
    () =>
      views.filter(
        (view: View) =>
          (view.createdBy === user.id || view.public === true) &&
          view.dataSourceId === parseInt(dataSourceId)
      ),
    [views, dataSourceId]
  );

  const [updateDataSource] = useUpdateDataSourceMutation();

  const changeHomepage = async (name: string) => {
      const options = {
        homepage: name,
      };

      await updateDataSource({
        dataSourceId,
        body: {
          options,
        },
      }).unwrap();
  };

  const defaultValue = useMemo(
    () =>
      `${(dataSource?.options as DataSourceOptions)?.homepage}` || "",
    [dataSource]
  );

  const isLoading = useMemo(
    () =>
      sessionIsLoading ||
      dashboardsAreLoading ||
      viewsAreLoading ||
      dataSourceIsLoading,
    [
      sessionIsLoading,
      dashboardsAreLoading,
      viewsAreLoading,
      dataSourceIsLoading,
    ]
  );

  return (
    <div className="my-3">
      <div className="w-1/2 mr-1">
        <TinyLabel>Homepage</TinyLabel>
      </div>
      <Select
        size="sm"
        defaultValue={defaultValue}
        onChange={(e) => changeHomepage(e.currentTarget.value)}
        isLoading={isLoading}
      >
        <option value="">
          Select homepage
        </option>
        <option disabled>
          Dashboards
        </option>
        {dashboards &&
          dashboards.map((dashboard: Dashboard, idx: number) => (
            <option key={idx} value={`dashboard:${dashboard.id}`}>
              {dashboard.name}
            </option>
          ))}
        <option disabled>
          Views
        </option>
        {filteredViews &&
          filteredViews.map((view: View, idx: number) => (
            <option key={idx} value={`view:${view.id}`}>
              {view.name}
            </option>
          ))}
      </Select>
    </div>
  );
}

export default DataSourceEditHomepage;

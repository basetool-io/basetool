import { Dashboard, View } from "@prisma/client";
import { DataSourceOptions } from "../types";
import { Select } from "@chakra-ui/react";
import { isEmpty } from "lodash";
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
    if (!isEmpty(name)) {
      const values = name.split("-");
      const options = {
        homepageType: values[0],
        homepageId: values[1],
      };

      await updateDataSource({
        dataSourceId,
        body: {
          options,
        },
      }).unwrap();
    }
  };

  const defaultValue = useMemo(
    () =>
      `${(dataSource?.options as DataSourceOptions)?.homepageType}-${
        (dataSource?.options as DataSourceOptions)?.homepageId
      }`,
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
        placeholder="Select homepage"
      >
        {dashboards &&
          dashboards.map((dashboard: Dashboard, idx: number) => (
            <option key={idx} value={`dashboard-${dashboard.id}`}>
              dashboard: {dashboard.name} ({dashboard.id})
            </option>
          ))}
        {filteredViews &&
          filteredViews.map((view: View, idx: number) => (
            <option key={idx} value={`view-${view.id}`}>
              view: {view.name} ({view.id})
            </option>
          ))}
      </Select>
    </div>
  );
}

export default DataSourceEditHomepage;

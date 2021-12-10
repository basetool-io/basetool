import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "@/features/api/ApiResponse";
import URI from "urijs";

export const api = createApi({
  reducerPath: "dashboards",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["Dashboard"],
  endpoints(builder) {
    return {
      addDashboard: builder.mutation<
        ApiResponse,
        Partial<{
          body: unknown;
        }>
      >({
        query: ({ body }) => ({
          url: `${apiUrl}/dashboards`,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "Dashboard", id: "LIST" }],
      }),
      getDashboards: builder.query<ApiResponse, { dataSourceId?: string; }>({
        query({dataSourceId}) {
          const queryParams = URI()
            .query({
              dataSourceId,
            })
            .query()
            .toString();

          return `/dashboards?${queryParams}`;
        },
        providesTags: [{ type: "Dashboard", id: "LIST" }],
      }),
      getDashboard: builder.query<ApiResponse, Partial<{ dashboardId: string }>>({
        query({ dashboardId }) {
          return `/dashboards/${dashboardId}`;
        },
        providesTags: (result, error, { dashboardId }) => [
          { type: "Dashboard", id: dashboardId },
        ],
      }),
      removeDashboard: builder.mutation<ApiResponse, Partial<{ dashboardId: string }>>({
        query: ({ dashboardId }) => ({
          url: `${apiUrl}/dashboards/${dashboardId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { dashboardId }) => [
          { type: "Dashboard", id: "LIST" },
          { type: "Dashboard", id: dashboardId },
        ],
      }),
      updateDashboard: builder.mutation<
        ApiResponse,
        Partial<{
          dashboardId: string;
          body: unknown;
        }>
      >({
        query: ({ dashboardId, body }) => ({
          url: `${apiUrl}/dashboards/${dashboardId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { dashboardId }) => [
          { type: "Dashboard", id: "LIST" },
          { type: "Dashboard", id: dashboardId },
        ],
      }),
    };
  },
});

export const {
  useAddDashboardMutation,
  useGetDashboardsQuery,
  useGetDashboardQuery,
  useRemoveDashboardMutation,
  useUpdateDashboardMutation
} = api;

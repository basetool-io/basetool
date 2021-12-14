import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "@/features/api/ApiResponse";
import URI from "urijs";

export const api = createApi({
  reducerPath: "dashboards",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["Dashboard", "DashboardItem"],
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

      getDashboardItemsValues: builder.query<ApiResponse, Partial<{ dashboardId: string }>>({
        query({ dashboardId }) {
          return `/dashboards/${dashboardId}/dashboardItemsValues`;
        },
        providesTags: (result, error, { dashboardId }) => [
          { type: "Dashboard", id: dashboardId },
        ],
      }),
      updateDashboardItem: builder.mutation<
        ApiResponse,
        Partial<{
          dashboardId: string;
          dashboardItemId: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ dashboardItemId, body }) => ({
          url: `${apiUrl}/dashboardItems/${dashboardItemId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { dashboardId, dashboardItemId }) => [
          { type: "DashboardItem", id: dashboardItemId },
          { type: "Dashboard", id: dashboardId },
        ],
        /**
         * Optimistic updates.
         */
        // onQueryStarted(
        //   { dashboardId, dashboardItemId, ...patch },
        //   { dispatch, queryFulfilled }
        // ) {
        //   if (!dashboardItemId) return;

        //   // When we start the query we're dispatching an update to the columns response where we simulate how the data will be updated.
        //   const patchResult = dispatch(
        //     api.util.updateQueryData("getDashboard", {
        //       dashboardId
        //     }, (draft) => {
        //       //find the item
        //       //modify with the changes
        //     })
        //     // fieldsApiSlice.util.updateQueryData(
        //     //   "getColumns",
        //     //   { viewId },
        //     //   (draft) => {
        //     //     const index = draft.data.findIndex(
        //     //       (column: Column) => column.name === columnName
        //     //     );
        //     //     const newData = {
        //     //       ...draft,
        //     //     };
        //     //     // re-create the data to be updated
        //     //     newData.data[index] = merge(draft.data[index], patch.body);

        //     //     // Update the response from `getColumns` with the mock data
        //     //     Object.assign(draft, newData);
        //     //   }
        //     // )
        //   );

        //   queryFulfilled
        //     .then(() =>
        //       dispatch(api.util.invalidateTags(["Dashboard"]))
        //     )
        //     .catch(() => patchResult.undo());
        // },
      }),
      deleteDashboardItem: builder.mutation<
        ApiResponse,
        Partial<{ dashboardId: string; dashboardItemId: string }>
      >({
        query: ({ dashboardItemId }) => ({
          url: `${apiUrl}/dashboardItems/${dashboardItemId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { dashboardId, dashboardItemId }) => [
          { type: "DashboardItem", id: dashboardItemId },
          { type: "Dashboard", id: dashboardId },
        ],
      }),
      addDashboardItem: builder.mutation<
        ApiResponse,
        Partial<{
          dashboardId: string;
          body: unknown;
        }>
      >({
        query: ({ body }) => ({
          url: `${apiUrl}/dashboardItems`,
          method: "POST",
          body,
        }),
        invalidatesTags: (result, error, { dashboardId }) => [
          { type: "Dashboard", id: dashboardId },
          { type: "DashboardItem", id: "LIST" }
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
  useUpdateDashboardMutation,

  useGetDashboardItemsValuesQuery,
  useDeleteDashboardItemMutation,
  useAddDashboardItemMutation,
  useUpdateDashboardItemMutation,
} = api;

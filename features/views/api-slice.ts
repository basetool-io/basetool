import { Column } from "../fields/types";
import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { merge } from "lodash";
import ApiResponse from "@/features/api/ApiResponse";

export const viewsApiSlice = createApi({
  reducerPath: "views",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["View", "ViewColumns"],
  endpoints(builder) {
    return {
      addView: builder.mutation<
        ApiResponse,
        Partial<{
          body: unknown;
        }>
      >({
        query: ({ body }) => ({
          url: `${apiUrl}/views`,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "View", id: "LIST" }],
      }),
      getViews: builder.query<ApiResponse, void>({
        query() {
          return `/views`;
        },
        providesTags: [{ type: "View", id: "LIST" }],
      }),
      getView: builder.query<ApiResponse, Partial<{ viewId: string }>>({
        query({ viewId }) {
          return `/views/${viewId}`;
        },
        providesTags: (result, error, { viewId }) => [
          { type: "View", id: viewId },
        ],
      }),
      removeView: builder.mutation<ApiResponse, Partial<{ viewId: string }>>({
        query: ({ viewId }) => ({
          url: `${apiUrl}/views/${viewId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { viewId }) => [
          { type: "View", id: "LIST" },
          { type: "View", id: viewId },
        ],
      }),
      updateView: builder.mutation<
        ApiResponse,
        Partial<{
          viewId: string;
          body: unknown;
        }>
      >({
        query: ({ viewId, body }) => ({
          url: `${apiUrl}/views/${viewId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { viewId }) => [
          { type: "View", id: "LIST" },
          { type: "View", id: viewId },
        ],
      }),

      /**
       * Columns
       */
      getColumns: builder.query<ApiResponse, { viewId: string }>({
        query({ viewId }) {
          return `/views/${viewId}/columns`;
        },
        providesTags: (response, error, { viewId }) => [
          { type: "ViewColumns", id: viewId },
        ],
      }),
      updateColumn: builder.mutation<
        ApiResponse,
        Partial<{
          viewId: string;
          columnName: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ viewId, columnName, body }) => ({
          url: `${apiUrl}/views/${viewId}/columns/${columnName}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { viewId }) => [
          { type: "ViewColumns", id: viewId },
        ],
        /**
         * Optimistic updates.
         */
        async onQueryStarted(
          { viewId, columnName, ...patch },
          { dispatch, queryFulfilled }
        ) {
          if (!viewId) return;

          // When we start the query we're dispatching an update to the columns response where we simulate how the data will be updated.
          const patchResult = dispatch(
            viewsApiSlice.util.updateQueryData(
              "getColumns",
              { viewId },
              (draft) => {
                const index = draft.data.findIndex(
                  (column: Column) => column.name === columnName
                );
                const newData = {
                  ...draft,
                };
                // re-create the data to be updated
                newData.data[index] = merge(draft.data[index], patch.body);

                // Update the response from `getColumns` with the mock data
                Object.assign(draft, newData);
              }
            )
          );

          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
      }),
    };
  },
});

export const {
  useAddViewMutation,
  useGetViewsQuery,
  useGetViewQuery,
  useRemoveViewMutation,
  useUpdateViewMutation,

  useGetColumnsQuery,
  useUpdateColumnMutation,
} = viewsApiSlice;

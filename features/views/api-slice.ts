import { Column } from "../fields/types";
import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { api as fieldsApiSlice } from "@/features/fields/api-slice";
import { merge } from "lodash";
import ApiResponse from "@/features/api/ApiResponse";

export const api = createApi({
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
      createColumn: builder.mutation<
        ApiResponse,
        Partial<{
          viewId: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ viewId, body }) => ({
          url: `${apiUrl}/views/${viewId}/columns`,
          method: "POST",
          body,
        }),
        invalidatesTags: (result, error, { viewId }) => [
          { type: "ViewColumns", id: viewId },
        ],
        onQueryStarted({ viewId, ...patch }, { dispatch, queryFulfilled }) {
          if (!viewId) return;

          // When we start the query we're dispatching an update to the columns response where we simulate how the data will be updated.
          const patchResult = dispatch(
            fieldsApiSlice.util.updateQueryData(
              "getColumns",
              { viewId },
              (draft) => {
                // Copy the present data
                const newData = {
                  data: [...draft.data],
                };

                // add the field
                newData.data.push(patch.body);

                // Update the response from `getColumns` with the mock data
                Object.assign(draft, newData);
              }
            )
          );

          // if the mutation succeeds we'll invalidate the columns tags
          // if it fails we'll undo the patch
          queryFulfilled
            .then(() =>
              dispatch(fieldsApiSlice.util.invalidateTags(["ViewColumns"]))
            )
            .catch(() => patchResult.undo());
        },
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
        onQueryStarted(
          { viewId, columnName, ...patch },
          { dispatch, queryFulfilled }
        ) {
          if (!viewId) return;

          // When we start the query we're dispatching an update to the columns response where we simulate how the data will be updated.
          const patchResult = dispatch(
            fieldsApiSlice.util.updateQueryData(
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

          queryFulfilled
            .then(() =>
              dispatch(fieldsApiSlice.util.invalidateTags(["ViewColumns"]))
            )
            .catch(() => patchResult.undo());
        },
      }),
      deleteColumn: builder.mutation<
        ApiResponse,
        Partial<{ viewId: string; columnName: string }>
      >({
        query: ({ viewId, columnName }) => ({
          url: `${apiUrl}/views/${viewId}/columns/${columnName}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { viewId }) => [
          { type: "ViewColumns", id: viewId },
        ],
        onQueryStarted(
          { viewId, columnName, ...patch },
          { dispatch, queryFulfilled }
        ) {
          if (!viewId || !columnName) return;

          // When we start the query we're dispatching an update to the columns response where we simulate how the data will be updated.
          const patchResult = dispatch(
            fieldsApiSlice.util.updateQueryData(
              "getColumns",
              { viewId },
              (draft) => {
                const index = draft.data.findIndex(
                  (column: Column) => column.name === columnName
                );
                const newData = {
                  data: [...draft.data],
                };

                // remove the field
                delete newData.data[index];
                newData.data = newData.data.filter(Boolean);

                // Update the response from `getColumns` with the mock data
                Object.assign(draft, newData);
              }
            )
          );

          queryFulfilled
            .then(() => {
              dispatch(fieldsApiSlice.util.invalidateTags(["ViewColumns"]));
            })
            .catch(() => patchResult.undo());
        },
      }),
      reorderColumns: builder.mutation<
        ApiResponse,
        Partial<{
          viewId: string;
          body: { order: string[] };
        }>
      >({
        query: ({ viewId, body }) => ({
          url: `${apiUrl}/views/${viewId}/columns/order`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { viewId }) => [
          { type: "ViewColumns", id: viewId },
        ],
        async onQueryStarted(
          { viewId, ...patch },
          { dispatch, queryFulfilled }
        ) {
          if (!viewId) return;

          // When we start the query we're dispatching an update to the columns response where we simulate how the data will be updated.
          const patchResult = dispatch(
            fieldsApiSlice.util.updateQueryData(
              "getColumns",
              { viewId },
              (draft) => {
                // Assign the new order indexes
                draft.data.forEach((column: Column, index: number) => {
                  if (patch?.body?.order.includes(column.name)) {
                    draft.data[index].baseOptions.orderIndex =
                      patch?.body?.order?.indexOf(column.name);
                  }
                });
              }
            )
          );

          try {
            await queryFulfilled;
            dispatch(fieldsApiSlice.util.invalidateTags(["ViewColumns"]));
          } catch (error) {
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
  useLazyGetViewsQuery,
  useGetViewQuery,
  useRemoveViewMutation,
  useUpdateViewMutation,

  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  useReorderColumnsMutation,
} = api;

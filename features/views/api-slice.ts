import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "@/features/api/ApiResponse";

export const viewsApiSlice = createApi({
  reducerPath: "views",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["View"],
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
        invalidatesTags: [
          { type: "View", id: "LIST" },
        ],
      }),
      getViews: builder.query<ApiResponse, void>({
        query() {
          return `/views`;
        },
        providesTags: [
          { type: "View", id: "LIST" },
        ],
      }),
      getView: builder.query<
        ApiResponse,
        Partial<{ viewId: string }>
      >({
        query({ viewId }) {
          return `/views/${viewId}`;
        },
        providesTags: (result, error, { viewId }) => [
          { type: "View", id: viewId },
        ],
      }),
      removeView: builder.mutation<
        ApiResponse,
        Partial<{ viewId: string }>
      >({
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
    };
  },
});

export const { useAddViewMutation, useGetViewsQuery, useGetViewQuery, useRemoveViewMutation, useUpdateViewMutation } = viewsApiSlice;

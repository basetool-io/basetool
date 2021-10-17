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
          dataSourceId: string;
          body: unknown;
        }>
      >({
        query: ({ dataSourceId, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/views`,
          method: "POST",
          body,
        }),
        invalidatesTags: [
          { type: "View", id: "LIST" },
        ],
      }),
      getViews: builder.query<ApiResponse, { dataSourceId: string }>({
        query({ dataSourceId }) {
          return `/data-sources/${dataSourceId}/views`;
        },
        providesTags: [
          { type: "View", id: "LIST" },
        ],
      }),
      getView: builder.query<
        ApiResponse,
        Partial<{ dataSourceId: string, viewId: string }>
      >({
        query({ dataSourceId, viewId }) {
          return `/data-sources/${dataSourceId}/views/${viewId}`;
        },
        providesTags: (result, error, { viewId }) => [
          { type: "View", id: viewId },
        ],
      }),
    };
  },
});

export const { useAddViewMutation, useGetViewsQuery, useGetViewQuery } = viewsApiSlice;

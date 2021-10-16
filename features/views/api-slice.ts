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
      }),
      getViews: builder.query<ApiResponse, { dataSourceId: string }>({
        query({ dataSourceId }) {
          return `/data-sources/${dataSourceId}/views`;
        },
        providesTags: (response, error, { dataSourceId }) => [
          { type: "View", id: "LIST" },
        ],
      }),
    };
  },
});

export const { useAddViewMutation, useGetViewsQuery } = viewsApiSlice;

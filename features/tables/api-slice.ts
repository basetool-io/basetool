import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "../api/ApiResponse";

export const tablesApiSlice = createApi({
  reducerPath: "tables",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["Table", "TableColumns"],
  endpoints(builder) {
    return {
      getTables: builder.query<ApiResponse, { dataSourceId: string }>({
        query({ dataSourceId }) {
          return `/data-sources/${dataSourceId}/tables`;
        },
        providesTags: (response, error, { dataSourceId }) => [
          { type: "Table", id: dataSourceId },
        ],
      }),
      updateTable: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ dataSourceId, tableName, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { dataSourceId, tableName }) => [
          { type: "Table", id: dataSourceId },
          { type: "TableColumns", id: tableName },
        ],
      }),
      updateTablesOrder: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          body: unknown;
        }>
      >({
        query: ({ dataSourceId, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/order`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { dataSourceId }) => [
          { type: "Table", id: dataSourceId },
        ],
      }),
    };
  },
});

export const {
  useGetTablesQuery,
  useUpdateTableMutation,
  useUpdateTablesOrderMutation,
  usePrefetch,
} = tablesApiSlice;

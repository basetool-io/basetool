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
      getColumns: builder.query<
        ApiResponse,
        { dataSourceId: string; tableName: string }
      >({
        query({ dataSourceId, tableName }) {
          return `/data-sources/${dataSourceId}/tables/${tableName}/columns`;
        },
        providesTags: (response, error, { tableName }) => [
          { type: "TableColumns", id: tableName },
        ],
      }),
      updateColumn: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          columnName: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ dataSourceId, tableName, columnName, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/columns/${columnName}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { tableName }) => [
          { type: "TableColumns", id: tableName },
        ],
      }),
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
      deleteColumn: builder.mutation<
        ApiResponse,
        Partial<{ dataSourceId: string; tableName: string; columnName: string }>
      >({
        query: ({ dataSourceId, tableName, columnName }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/columns/${columnName}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { tableName }) => [
          { type: "TableColumns", id: tableName },
        ],
      }),
      createColumn: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ dataSourceId, tableName, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/columns`,
          method: "POST",
          body,
        }),
        invalidatesTags: (result, error, { tableName }) => [
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
      updateColumnsOrder: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ dataSourceId, tableName, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/columns/order`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { dataSourceId, tableName }) => [
          { type: "TableColumns", id: tableName },
        ],
      }),
    };
  },
});

export const {
  useGetColumnsQuery,
  useUpdateColumnMutation,
  useGetTablesQuery,
  useDeleteColumnMutation,
  useCreateColumnMutation,
  useUpdateTableMutation,
  useUpdateTablesOrderMutation,
  useUpdateColumnsOrderMutation,
  usePrefetch,
} = tablesApiSlice;

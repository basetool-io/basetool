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
          { type: "TableColumns", id: "LIST" },
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
          { type: "Table", id: "LIST" },
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
        invalidatesTags: (result, error, { dataSourceId }) => [
          { type: "Table", id: dataSourceId },
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
          { type: "TableColumns", id: "LIST" },
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
          { type: "TableColumns", id: "LIST" },
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
  usePrefetch,
} = tablesApiSlice;

import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "@/features/api/ApiResponse";

export const dataSourcesApiSlice = createApi({
  reducerPath: "dataSources",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["DataSource"],
  endpoints(builder) {
    return {
      // getTabledataSources: builder.query<ApiResponse, {dataSourceId: string, tableName: string}>({
      //   query({ dataSourceId, tableName }) {
      //     return `/data-sources/${dataSourceId}/tables/${tableName}/dataSources`
      //   },
      //   providesTags: (response) => {
      //     // is result available?
      //     if (response && response?.data) {
      //       // successful query
      //       return [
      //         ...response?.data?.map(({ id }: {id: string | number}) => ({ type: 'dataSource', id } as const)),
      //         { type: 'dataSource', id: 'LIST' },
      //       ]
      //     }

      //     // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
      //     return [{ type: 'dataSource', id: 'LIST' }]
      //   },
      // }),
      getAuthUrl: builder.query<
        ApiResponse,
        Partial<{ dataSourceName: string }>
      >({
        query({ dataSourceName }) {
          return `/data-sources/${dataSourceName}/auth-url`;
        },
      }),
      getSheets: builder.query<
        ApiResponse,
        Partial<{ dataSourceName: string; dataSourceId: string }>
      >({
        query({ dataSourceName, dataSourceId }) {
          return `/data-sources/${dataSourceName}/${dataSourceId}/sheets`;
        },
      }),
      setSheetToDataSource: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceName: string;
          dataSourceId: string;
          spreadsheetId: string;
          spreadsheetName: string;
        }>
      >({
        query: ({ dataSourceName, dataSourceId, spreadsheetId, spreadsheetName }) => ({
          url: `/data-sources/${dataSourceName}/${dataSourceId}/sheets`,
          method: "POST",
          body: { spreadsheetId, spreadsheetName },
        }),
      }),
      getDataSource: builder.query<
        ApiResponse,
        Partial<{ dataSourceId: string }>
      >({
        query({ dataSourceId }) {
          return `/data-sources/${dataSourceId}`;
        },
        providesTags: (result, error, { dataSourceId }) => [
          { type: "DataSource", id: dataSourceId },
        ],
      }),
      getDataSources: builder.query<ApiResponse, void>({
        query() {
          return "/data-sources";
        },
        providesTags: [{ type: "DataSource", id: "LIST" }],
      }),
      //   getDataSource: builder.query<ApiResponse, {dataSourceId: string, tableName: string, dataSourceId?: string}>({
      //     query({ dataSourceId, tableName, dataSourceId }) {
      //       return `/data-sources/${dataSourceId}/tables/${tableName}/dataSources/${dataSourceId}`
      //     },
      //     providesTags: (result, error, { dataSourceId }) => ([{ type: 'dataSource', id: dataSourceId }]),
      //   }),
      addDataSource: builder.mutation<ApiResponse, Partial<{ body: unknown }>>({
        query: ({ body }) => ({
          url: `${apiUrl}/data-sources`,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "DataSource", id: "LIST" }],
      }),
      removeDataSource: builder.mutation<
        ApiResponse,
        Partial<{ dataSourceId: string }>
      >({
        query: ({ dataSourceId }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { dataSourceId }) => [
          { type: "DataSource", id: "LIST" },
          { type: "DataSource", id: dataSourceId },
        ],
      }),
      updateDataSource: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          body: unknown;
        }>
      >({
        query: ({ dataSourceId, tableName, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/dataSources/${dataSourceId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { dataSourceId }) => [
          { type: "DataSource", id: dataSourceId },
        ],
      }),
    };
  },
});

export const {
  // useGetTabledataSourcesQuery,
  useGetDataSourceQuery,
  useGetAuthUrlQuery,
  useGetSheetsQuery,
  useSetSheetToDataSourceMutation,
  useGetDataSourcesQuery,
  useAddDataSourceMutation,
  useRemoveDataSourceMutation,
  useUpdateDataSourceMutation,
  usePrefetch,
} = dataSourcesApiSlice;

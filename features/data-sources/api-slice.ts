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
  useGetDataSourcesQuery,
  useAddDataSourceMutation,
  useUpdateDataSourceMutation,
  usePrefetch,
} = dataSourcesApiSlice;

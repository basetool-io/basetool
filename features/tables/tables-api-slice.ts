import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import ApiResponse from '../api/ApiResponse'
import { apiUrl } from '../api/urls'

export const tablesApiSlice = createApi({
  reducerPath: 'tables',
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ['Table', 'TableColumns'],
  endpoints(builder) {
    return {
      getTables: builder.query<ApiResponse, string>({
        query(id) {
          return `/data-sources/${id}/tables`
        },
      }),
      // getTableProperties: builder.query<ApiResponse, {dataSourceId: string, tableName: string}>({
      //   query({ dataSourceId, tableName }) {
      //     return `/data-sources/${dataSourceId}/tables/${tableName}`
      //   },
      //   providesTags: ['Table'],
      // }),
      getColumns: builder.query<ApiResponse, {dataSourceId: string, tableName: string}>({
        query({ dataSourceId, tableName }) {
          return `/data-sources/${dataSourceId}/tables/${tableName}/columns`
        },
        providesTags: (response, error, { tableName }) => [{ type: 'TableColumns', id: tableName }],
      }),
      updateColumns: builder.mutation<ApiResponse, Partial<{dataSourceId: string, tableName: string, body: object}>>({
        query: ({
          dataSourceId, tableName, body,
        }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/columns`,
          method: 'PUT',
          body,
        }),
        invalidatesTags: (result, error, { tableName }) => [{ type: 'TableColumns', id: tableName }],
      }),
    }
  },
})

export const {
  useGetTablesQuery,
  // useGetTablePropertiesQuery,
  useGetColumnsQuery,
  useUpdateColumnsMutation,
} = tablesApiSlice

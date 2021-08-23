import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import ApiResponse from '../api/ApiResponse'
import { apiUrl } from '../api/urls'

export const recordsApiSlice = createApi({
  reducerPath: 'records',
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ['Record'],
  endpoints(builder) {
    return {
      getTableRecords: builder.query<ApiResponse, {dataSourceId: string, tableName: string}>({
        query({ dataSourceId, tableName }) {
          return `/data-sources/${dataSourceId}/tables/${tableName}/records`
        },
        providesTags: (response) => {
          // is result available?
          if (response && response?.data) {
            // successful query
            return [
              ...response?.data?.map(({ id }: {id: string | number}) => ({ type: 'Record', id } as const)),
              { type: 'Record', id: 'LIST' },
            ]
          }

          // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
          return [{ type: 'Record', id: 'LIST' }]
        },
      }),
      getRecord: builder.query<ApiResponse, {dataSourceId: string, tableName: string, recordId?: string}>({
        query({ dataSourceId, tableName, recordId }) {
          return `/data-sources/${dataSourceId}/tables/${tableName}/records/${recordId}`
        },
        providesTags: (result, error, { recordId }) => ([{ type: 'Record', id: recordId }]),
      }),
      addRecord: builder.mutation<ApiResponse, Partial<{dataSourceId: string, tableName: string, body: object}>>({
        query: ({
          dataSourceId, tableName, body,
        }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/records`,
          method: 'POST',
          body,
        }),
        invalidatesTags: [{ type: 'Record', id: 'LIST' }],
      }),
      updateRecord: builder.mutation<ApiResponse, Partial<{dataSourceId: string, tableName: string, recordId: string, body: object}>>({
        query: ({
          dataSourceId, tableName, recordId, body,
        }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/records/${recordId}`,
          method: 'PUT',
          body,
        }),
        invalidatesTags: (result, error, { recordId }) => ([{ type: 'Record', id: recordId }]),
      }),
    }
  },
})

export const {
  useGetTableRecordsQuery,
  useGetRecordQuery,
  useAddRecordMutation,
  useUpdateRecordMutation,
  usePrefetch,
} = recordsApiSlice

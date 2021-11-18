import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "../api/ApiResponse";
import URI from "urijs";

export const recordsApiSlice = createApi({
  reducerPath: "records",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["Record"],
  endpoints(builder) {
    return {
      getRecords: builder.query<
        ApiResponse,
        {
          dataSourceId?: string;
          tableName?: string;
          viewId?: string;
          filters?: string;
          limit?: string;
          offset?: string;
          orderBy?: string;
          orderDirection?: string;
        }
      >({
        query: ({
          dataSourceId,
          tableName,
          // we keep the viewId for triggering getRecords when table and ds didn't change, but view is changed
          viewId,
          filters,
          limit,
          offset,
          orderBy,
          orderDirection,
        }) => {
          const queryParams = URI()
            .query({
              viewId,
              tableName,
              dataSourceId,
              orderBy,
              orderDirection,
              filters,
              limit,
              offset,
            })
            .query()
            .toString();

          return `/records?${queryParams}`;
        },
        providesTags: (response) => {
          // is result available?
          if (response && response?.data) {
            // successful query
            return [
              ...response?.data?.map(
                ({ id }: { id: string | number }) =>
                  ({ type: "Record", id } as const)
              ),
              { type: "Record", id: "LIST" },
            ];
          }

          // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
          return [{ type: "Record", id: "LIST" }];
        },
      }),
      getRecord: builder.query<
        ApiResponse,
        { dataSourceId: string; tableName: string; recordId?: string }
      >({
        query({ dataSourceId, tableName, recordId }) {
          return `/data-sources/${dataSourceId}/tables/${tableName}/records/${recordId}`;
        },
        providesTags: (result, error, { recordId }) => [
          { type: "Record", id: recordId },
        ],
      }),
      createRecord: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ dataSourceId, tableName, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/records`,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "Record", id: "LIST" }],
      }),
      updateRecord: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          recordId: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ dataSourceId, tableName, recordId, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/records/${recordId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { recordId }) => [
          { type: "Record", id: recordId },
        ],
      }),
      deleteRecord: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          recordId: string;
        }>
      >({
        query: ({ dataSourceId, tableName, recordId }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/records/${recordId}`,
          method: "DELETE",
        }),
        invalidatesTags: [{ type: "Record", id: "LIST" }],
      }),
      deleteBulkRecords: builder.mutation<
        ApiResponse,
        Partial<{
          dataSourceId: string;
          tableName: string;
          recordIds: number[];
        }>
      >({
        query: ({ dataSourceId, tableName, recordIds }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}/tables/${tableName}/records/bulk`,
          method: "DELETE",
          body: recordIds,
        }),
        invalidatesTags: [{ type: "Record", id: "LIST" }],
      }),
    };
  },
});

export const {
  useGetRecordsQuery,
  useLazyGetRecordsQuery,
  useGetRecordQuery,
  useCreateRecordMutation,
  useUpdateRecordMutation,
  usePrefetch,
  useDeleteRecordMutation,
  useDeleteBulkRecordsMutation,
} = recordsApiSlice;

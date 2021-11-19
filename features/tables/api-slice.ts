import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "../api/ApiResponse";

export const tablesApiSlice = createApi({
  reducerPath: "tables",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["Table"],
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
    };
  },
});

export const {
  useGetTablesQuery,
  usePrefetch,
} = tablesApiSlice;

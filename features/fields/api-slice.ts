import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "../api/ApiResponse";
import URI from "urijs";

export const api = createApi({
  reducerPath: "fields",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["Table", "TableColumns"],
  endpoints(builder) {
    return {
      getColumns: builder.query<
        ApiResponse,
        { dataSourceId?: string; tableName?: string; viewId?: string }
      >({
        query({ dataSourceId, tableName, viewId }) {
          const queryParams = URI()
            .query({
              dataSourceId,
              tableName,
              viewId,
            })
            .query()
            .toString();

          return `/columns?${queryParams}`;
        },
        providesTags: (response, error, { tableName }) => [
          { type: "TableColumns", id: tableName },
        ],
      }),
    };
  },
});

export const { useGetColumnsQuery, usePrefetch } = api;

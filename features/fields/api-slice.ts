import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "../api/ApiResponse";
import URI from "urijs";

export const api = createApi({
  reducerPath: "fields",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["ViewColumns", "TableColumns"],
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
        providesTags: (response, error, { tableName, viewId }) => {
          if (viewId) return [{ type: "ViewColumns", id: tableName }];

          if (tableName) return [{ type: "TableColumns", id: tableName }];

          return [];
        },
      }),
    };
  },
});

export const { useGetColumnsQuery, usePrefetch } = api;

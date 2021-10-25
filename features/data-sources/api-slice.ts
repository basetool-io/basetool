import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { first } from "lodash";
import ApiResponse from "@/features/api/ApiResponse";

export const dataSourcesApiSlice = createApi({
  reducerPath: "dataSources",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["DataSource", "Sheets", "Table"],
  endpoints(builder) {
    return {
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
        providesTags: [{ type: "Sheets", id: "LIST" }],
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
        query: ({
          dataSourceName,
          dataSourceId,
          spreadsheetId,
          spreadsheetName,
        }) => ({
          url: `/data-sources/${dataSourceName}/${dataSourceId}/sheets`,
          method: "POST",
          body: { spreadsheetId, spreadsheetName },
        }),
        invalidatesTags: (result, error, { dataSourceId }) => [
          { type: "DataSource", id: dataSourceId },
          { type: "Sheets", id: "LIST" },
        ],
      }),
      // Google Sheets 👆

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
          body: unknown;
        }>
      >({
        query: ({ dataSourceId, body }) => ({
          url: `${apiUrl}/data-sources/${dataSourceId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { dataSourceId }) => [
          { type: "DataSource", id: dataSourceId },
          { type: "DataSource", id: "LIST" },
        ],
      }),
      checkConnection: builder.mutation<unknown, Partial<{ body: any }>>({
        /**
         * Using queryFn to build up the FormData object
         */
        async queryFn({ body }, _queryApi, _extraOptions, fetchWithBQ) {
          // upload with multipart/form-data
          const formData = new FormData();

          // Append common data
          formData.append("type", body.type);
          formData.append("credentials", JSON.stringify(body.credentials));

          // Append ssh if it meets the requirements.
          if (body?.ssh?.host) {
            formData.append("ssh", JSON.stringify(body.ssh));
            // Append the file
            if (first(body?.ssh?.key)) {
              formData.append("key", first(body?.ssh?.key) as any);
            }
          }

          const response = await fetchWithBQ({
            url: `${apiUrl}/data-sources/check-connection`,
            method: "POST",
            body: formData,
          });

          if (response.error) throw response.error;

          return response.data
            ? { data: response.data }
            : { error: response.error };
        },
      }),
    };
  },
});

export const {
  useGetDataSourceQuery,
  useGetAuthUrlQuery,
  useGetSheetsQuery,
  useSetSheetToDataSourceMutation,
  useGetDataSourcesQuery,
  useAddDataSourceMutation,
  useRemoveDataSourceMutation,
  useUpdateDataSourceMutation,
  useCheckConnectionMutation,
  usePrefetch,
} = dataSourcesApiSlice;

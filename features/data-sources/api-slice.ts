import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { first } from "lodash";
import ApiResponse from "@/features/api/ApiResponse";

const dataSourceFormData = (body: any) => {
  // upload with multipart/form-data
  const formData = new FormData();

  // Append common data
  formData.append("name", body.name);
  formData.append("options", JSON.stringify(body.options));
  formData.append("organizationId", body.organizationId);
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

  return formData;
};

/**
 * Using queryFn to build up the FormData object
 */
const createDataSourceFn =
  (url: string) =>
  async (
    { body }: any,
    _queryApi: any,
    _extraOptions: any,
    fetchWithBQ: any
  ) => {
    const formData = dataSourceFormData(body);

    const response = await fetchWithBQ({
      url,
      method: "POST",
      body: formData,
    });

    return response.data ? { data: response.data } : { error: response.error };
  };

export const dataSourcesApiSlice = createApi({
  reducerPath: "dataSources",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["DataSource", "Sheets"],
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
        queryFn: createDataSourceFn(`${apiUrl}/data-sources`),
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
        queryFn: createDataSourceFn(`${apiUrl}/data-sources/check-connection`),
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
  useCheckConnectionMutation,
  usePrefetch,
} = dataSourcesApiSlice;

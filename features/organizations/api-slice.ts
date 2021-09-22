import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "@/features/api/ApiResponse";

export const organizationsApiSlice = createApi({
  reducerPath: "organizations",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["Organization"],
  endpoints(builder) {
    return {
      getOrganization: builder.query<
        ApiResponse,
        Partial<{ organizationId: string }>
      >({
        query({ organizationId }) {
          return `/organizations/${organizationId}`;
        },
        providesTags: (result, error, { organizationId }) => [
          { type: "Organization", id: organizationId },
        ],
      }),
      // getOrganizations: builder.query<ApiResponse, void>({
      //   query() {
      //     return "/organizations";
      //   },
      //   providesTags: [{ type: "Organization", id: "LIST" }],
      // }),
      // addOrganization: builder.mutation<ApiResponse, Partial<{ body: unknown }>>({
      //   query: ({ body }) => ({
      //     url: `${apiUrl}/organizations`,
      //     method: "POST",
      //     body,
      //   }),
      //   invalidatesTags: [{ type: "Organization", id: "LIST" }],
      // }),
      // removeOrganization: builder.mutation<
      //   ApiResponse,
      //   Partial<{ organizationId: string }>
      // >({
      //   query: ({ organizationId }) => ({
      //     url: `${apiUrl}/organizations/${organizationId}`,
      //     method: "DELETE",
      //   }),
      //   invalidatesTags: (result, error, { organizationId }) => [
      //     { type: "Organization", id: "LIST" },
      //     { type: "Organization", id: organizationId },
      //   ],
      // }),
      updateOrganization: builder.mutation<
        ApiResponse,
        Partial<{
          organizationId: string;
          tableName: string;
          body: unknown;
        }>
      >({
        query: ({ organizationId, body }) => ({
          url: `/organizations/${organizationId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { organizationId }) => [
          { type: "Organization", id: organizationId },
        ],
      }),
    };
  },
});

export const {
  useGetOrganizationQuery,
  // useGetAuthUrlQuery,
  // useGetSheetsQuery,
  // useSetSheetToOrganizationMutation,
  // useGetOrganizationsQuery,
  // useAddOrganizationMutation,
  // useRemoveOrganizationMutation,
  useUpdateOrganizationMutation,
  usePrefetch,
} = organizationsApiSlice;

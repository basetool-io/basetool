import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "@/features/api/ApiResponse";

export const organizationsApiSlice = createApi({
  reducerPath: "organizations",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["Organization", "User"],
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
          { type: "User", id: "LIST" },
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
      removeMember: builder.mutation<
        ApiResponse,
        Partial<{ organizationId: string, userId: string }>
      >({
        query: ({ organizationId, userId }) => ({
          url: `/organizations/${organizationId}/users/${userId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { userId }) => [
          { type: "User", id: "LIST" },
          { type: "User", id: userId },
        ],
      }),
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
  useRemoveMemberMutation,
  useUpdateOrganizationMutation,
  usePrefetch,
} = organizationsApiSlice;

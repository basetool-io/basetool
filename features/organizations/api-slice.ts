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
      inviteMember: builder.mutation<
        ApiResponse,
        Partial<{
          organizationId: string;
          body: { email: string; roleId: number };
        }>
      >({
        // create an invitation
        query: ({ organizationId, body }) => ({
          url: `/organizations/${organizationId}/invitations`,
          method: "POST",
          body,
        }),
        invalidatesTags: (response) => [
          {
            type: "Organization",
            id: response?.data?.organizationUser?.organizationId,
          },
          { type: "User", id: "LIST" },
        ],
      }),
      acceptInvitation: builder.mutation<
        ApiResponse,
        Partial<{
          organizationId: string;
          body: { uuid: string; formData: {email: string; firstName: number; lastName: string; password: string } };
        }>
      >({
        // update an invitation
        query: ({ organizationId, body }) => ({
          url: `/organizations/${organizationId}/invitations`,
          method: "PUT",
          body,
        }),
      }),
      updateMemberRole: builder.mutation<
        ApiResponse,
        Partial<{
          organizationId: string;
          userId: string;
          body: { roleId: number };
        }>
      >({
        query: ({ organizationId, userId, body }) => ({
          url: `/organizations/${organizationId}/users/${userId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { userId }) => [
          { type: "User", id: "LIST" },
          { type: "User", id: userId },
        ],
      }),
      removeMember: builder.mutation<
        ApiResponse,
        Partial<{ organizationId: string; userId: string }>
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
  useAcceptInvitationMutation,
  useRemoveMemberMutation,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useUpdateOrganizationMutation,
  usePrefetch,
} = organizationsApiSlice;

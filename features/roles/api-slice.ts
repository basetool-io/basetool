import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "../api/ApiResponse";

export const rolesApiSlice = createApi({
  reducerPath: "rolesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
  }),
  tagTypes: ["Role", "Organization"],
  endpoints(builder) {
    return {
      getRoles: builder.query<ApiResponse, Partial<{ organizationId: string }>>(
        {
          query: ({ organizationId }) =>
            `/organizations/${organizationId}/roles`,
          providesTags: (response) => {
            // is result available?
            if (response && response?.data) {
              // successful query
              return [
                ...response?.data?.map(
                  ({ id }: { id: string | number }) =>
                    ({ type: "Role", id } as const)
                ),
                { type: "Role", id: "LIST" },
              ];
            }

            // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
            return [{ type: "Role", id: "LIST" }];
          },
        }
      ),
      createRole: builder.mutation<
        ApiResponse,
        Partial<{
          organizationId: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ organizationId, body }) => ({
          url: `${apiUrl}/organizations/${organizationId}/roles/`,
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "Role", id: "LIST" }],
      }),
      updateRole: builder.mutation<
        ApiResponse,
        Partial<{
          organizationId: string;
          roleId: string;
          body: Record<string, unknown>;
        }>
      >({
        query: ({ organizationId, roleId, body }) => ({
          url: `${apiUrl}/organizations/${organizationId}/roles/${roleId}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (result, error, { organizationId, roleId }) => [
          { type: "Role", id: roleId },
          { type: "Organization", id: organizationId },
        ],
      }),
      deleteRole: builder.mutation<ApiResponse, Partial<{ organizationId: string, roleId: string }>>({
        query: ({ organizationId, roleId }) => ({
          url: `${apiUrl}/organizations/${organizationId}/roles/${roleId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { roleId }) => [{ type: "Role", id: "LIST" }, { type: "Role", id: roleId }, ],
      }),
    };
  },
});

// get user role and options
export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApiSlice;

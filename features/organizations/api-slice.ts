import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "../api/ApiResponse";

export const organizationsApiSlice = createApi({
  reducerPath: "organizationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
  }),
  tagTypes: ["Organization"],
  endpoints(builder) {
    return {
      getOrganizations: builder.query({
        query: () =>
          `/organizations`,
        providesTags: (response) => {
          // is result available?
          if (response && response?.data) {
            // successful query
            return [
              ...response?.data?.map(
                ({ id }: { id: string | number }) =>
                  ({ type: "Organization", id } as const)
              ),
              { type: "Organization", id: "LIST" },
            ];
          }

          // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
          return [{ type: "Organization", id: "LIST" }];
        },
      }),
      getOrganization: builder.query<
        ApiResponse,
        { organizationId: string; }
      >({
        query({ organizationId }) {
          return `/organizations/${organizationId}`;
        },
        providesTags: (result, error, { organizationId }) => [
          { type: "Organization", id: organizationId },
        ],
      }),
    };
  },
});

export const {
  useGetOrganizationQuery,
  useGetOrganizationsQuery,
} = organizationsApiSlice;

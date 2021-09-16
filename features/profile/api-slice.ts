import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileApiSlice = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
  }),
  tagTypes: ["Profile"],
  endpoints(builder) {
    return {
      getProfile: builder.query({
        query: () =>
          `/profile`,
        providesTags: (response) => {
          // is result available?
          if (response && response?.data) {

            // successful query
            return [{ type: "Profile", id: response?.data?.user?.email }];
          }

          return [];
        },
      }),
    };
  },
});

export const {
  useGetProfileQuery,
} = profileApiSlice;

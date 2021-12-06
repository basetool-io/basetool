import { apiUrl } from "../api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "../api/ApiResponse";

export const profileApiSlice = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
  }),
  tagTypes: ["Profile"],
  endpoints(builder) {
    return {
      getProfile: builder.query({
        query: () => `/profile`,
        providesTags: (response) => {
          // is result available?
          if (response && response?.data) {
            // successful query
            return [{ type: "Profile", id: response?.data?.user?.email }];
          }

          return [];
        },
      }),
      sendFeedback: builder.mutation<
        ApiResponse,
        Partial<{
          body: { note: string, emotion: string, url: string };
        }>
      >({
        query: ({ body }) => ({
          url: `${apiUrl}/feedback`,
          method: "POST",
          body,
        }),
      }),
    };
  },
});

export const { useGetProfileQuery, useSendFeedbackMutation } = profileApiSlice;

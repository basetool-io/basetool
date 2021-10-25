import { apiUrl } from "@/features/api/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import ApiResponse from "@/features/api/ApiResponse";

export const favouritesApiSlice = createApi({
  reducerPath: "favourites",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}`,
  }),
  tagTypes: ["FavouriteItem"],
  endpoints(builder) {
    return {
      addFavourite: builder.mutation<
        ApiResponse,
        Partial<{
          body: unknown;
        }>
      >({
        query: ({ body }) => ({
          url: `${apiUrl}/favourites`,
          method: "POST",
          body,
        }),
        invalidatesTags: [
          { type: "FavouriteItem", id: "LIST" },
        ],
      }),
      getFavourites: builder.query<ApiResponse, void>({
        query() {
          return `/favourites`;
        },
        providesTags: [
          { type: "FavouriteItem", id: "LIST" },
        ],
      }),
      removeFavourite: builder.mutation<
        ApiResponse,
        Partial<{ favouriteId: string }>
      >({
        query: ({ favouriteId }) => ({
          url: `${apiUrl}/favourites/${favouriteId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { favouriteId }) => [
          { type: "FavouriteItem", id: "LIST" },
          { type: "FavouriteItem", id: favouriteId },
        ],
      }),
    };
  },
});

export const { useAddFavouriteMutation, useGetFavouritesQuery, useRemoveFavouriteMutation } = favouritesApiSlice;

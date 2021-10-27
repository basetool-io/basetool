import { FavouriteItem } from "@prisma/client";
import { Middleware, configureStore } from "@reduxjs/toolkit";
import { dataSourcesApiSlice } from "@/features/data-sources/api-slice";
import { favouritesApiSlice } from "@/features/favourites/api-slice";
import { keys } from "lodash";
import { organizationsApiSlice } from "@/features/organizations/api-slice";
import { profileApiSlice } from "@/features/profile/api-slice";
import { reactToError, reactToResponse } from "@/features/api/ApiService";
import { recordsApiSlice } from "@/features/records/api-slice";
import { rolesApiSlice } from "@/features/roles/api-slice";
import { tablesApiSlice } from "@/features/tables/api-slice";
import { viewsApiSlice } from "@/features/views/api-slice";
import appReducer from "@/features/app/state-slice";
import recordsReducer from "@/features/records/state-slice";

/**
 * Show a toast.
 */
export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  // Added for when fetching the data fails with 500
  if (action.type.includes("/rejected") && action?.payload?.status === 500) {
    reactToError(action.payload.data);
  }

  if (action.type.includes("/fulfilled")) {
    const requiredKeys = ["error", "messages", "ok", "status"];
    const hasRequiredKeys = requiredKeys.every((key) =>
      keys(action.payload).includes(key)
    );

    if (action.payload && hasRequiredKeys) {
      reactToResponse(action.payload);
    }
  }

  return next(action);
};

/**
 * Deletes favouriteItem when view/record is deleted, matching by url.
 */
export const deleteRelatedFavourites: Middleware = () => (next) => (action) => {
  const deletePath = (path: string) => {
    const getFavourites = store.dispatch(
      favouritesApiSlice.endpoints.getFavourites.initiate()
    );

    // const init = store.dispatch(viewsApiSlice.endpoints.getViews.initiate())
    getFavourites.then((finalResult) => {
      console.log("finalResult->", finalResult);
      const allFavourites = finalResult?.data?.data;
      const favouriteIdsMatchingPath = allFavourites
        .filter((fav: FavouriteItem) => fav.url === path)
        .map((fav: FavouriteItem) => fav.id);
      console.log("favouriteIdsMatchingPath->", favouriteIdsMatchingPath);
      const removeFavourite = store.dispatch(
        favouritesApiSlice.endpoints.removeFavourite.initiate({
          favouriteId: favouriteIdsMatchingPath[0],
        })
      );
      removeFavourite.then((finalResult) => {
        console.log("removeFavouritefinalResult->", finalResult);
      });
    });
  };

  if (action.type.includes("/fulfilled")) {
    console.log('action', action)
    // const { isFavourite, removeFavourite } = useFavourites();
    // const [removeFavourite, { isLoading: remFavIsLoading }] =
    //   useRemoveFavouriteMutation();

    // const getViews = viewsApiSlice.endpoints.getViews;
    // console.log("getViews->", getViews);
    // console.log("getViews.initiate()->", getViews.initiate());
    // console.log("getViews.initiate(undefined)->", getViews.initiate(undefined));

    // console.log("getViews.select()->", getViews.select());
    // console.log("getViews.select(undefined)->", getViews.select(undefined));

    // console.log("getViews.useQuery()->", getViews.useQuery());
    // console.log("getViews.useQuery(undefined)->", getViews.useQuery(undefined));

    const args = action?.meta?.arg;
    switch (args?.endpointName) {
      case "deleteRecord":
        const path = `/data-sources/${args.originalArgs.dataSourceId}/tables/${args.originalArgs.tableName}/${args.originalArgs.recordId}`;
        console.log("path->", path);
        deletePath(path);
        // const getFavourites = createAction('favourites/getFavourites')

        // console.log('getFavourites()->', getFavourites())
        // const deleteFavourite = createAction('favouritesApiSlice/removeFavourite');
        // console.log('deleteFavourite->', deleteFavourite)
        break;
      // console.log('action?.meta?.arg?.endpointName->', action?.meta?.arg?.endpointName)
      case "deleteBulkRecords":
        console.log("action->", action);
        break;
      case "removeView":
        console.log("action->", action);
        const viewPath = `/views/${args.originalArgs.viewId}`;
        console.log("path->", viewPath);
        deletePath(viewPath);
        break;
    }
  }

  return next(action);
};

const store = configureStore({
  reducer: {
    appState: appReducer,
    recordsState: recordsReducer,
    [dataSourcesApiSlice.reducerPath]: dataSourcesApiSlice.reducer,
    [organizationsApiSlice.reducerPath]: organizationsApiSlice.reducer,
    [recordsApiSlice.reducerPath]: recordsApiSlice.reducer,
    [rolesApiSlice.reducerPath]: rolesApiSlice.reducer,
    [tablesApiSlice.reducerPath]: tablesApiSlice.reducer,
    [profileApiSlice.reducerPath]: profileApiSlice.reducer,
    [viewsApiSlice.reducerPath]: viewsApiSlice.reducer,
    [favouritesApiSlice.reducerPath]: favouritesApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      dataSourcesApiSlice.middleware,
      organizationsApiSlice.middleware,
      recordsApiSlice.middleware,
      rolesApiSlice.middleware,
      tablesApiSlice.middleware,
      profileApiSlice.middleware,
      viewsApiSlice.middleware,
      favouritesApiSlice.middleware,
      deleteRelatedFavourites,
      rtkQueryErrorLogger
    ),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

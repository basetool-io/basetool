import { Middleware, configureStore } from "@reduxjs/toolkit";
import { dataSourcesApiSlice } from "@/features/data-sources/api-slice";
import { api as fieldsApiSlice } from "@/features/fields/api-slice";
import { keys } from "lodash";
import { organizationsApiSlice } from "@/features/organizations/api-slice";
import { profileApiSlice } from "@/features/profile/api-slice";
import { reactToError, reactToResponse } from "@/features/api/ApiService";
import { recordsApiSlice } from "@/features/records/api-slice";
import { rolesApiSlice } from "@/features/roles/api-slice";
import { tablesApiSlice } from "@/features/tables/api-slice";
import { api as viewsApiSlice } from "@/features/views/api-slice";
import appState from "@/features/app/state-slice";
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

const store = configureStore({
  reducer: {
    appState: appState,
    recordsState: recordsReducer,
    [dataSourcesApiSlice.reducerPath]: dataSourcesApiSlice.reducer,
    [organizationsApiSlice.reducerPath]: organizationsApiSlice.reducer,
    [recordsApiSlice.reducerPath]: recordsApiSlice.reducer,
    [rolesApiSlice.reducerPath]: rolesApiSlice.reducer,
    [tablesApiSlice.reducerPath]: tablesApiSlice.reducer,
    [profileApiSlice.reducerPath]: profileApiSlice.reducer,
    [viewsApiSlice.reducerPath]: viewsApiSlice.reducer,
    [fieldsApiSlice.reducerPath]: fieldsApiSlice.reducer,
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
      fieldsApiSlice.middleware,
      rtkQueryErrorLogger
    ),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

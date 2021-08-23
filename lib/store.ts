import {
  Middleware,
  configureStore,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
// import { appVersionsApiSlice } from '@/features/apps/app-versions-api-slice'
// import { appsApiSlice } from '@/features/apps/apps-api-slice'
import { keys } from "lodash";
import { recordsApiSlice } from "@/features/records/records-api-slice";
import { tablesApiSlice } from "@/features/tables/tables-api-slice";
import { dataSourcesApiSlice } from "@/features/data-sources/api-slice";
// import appStateReducer from '@/features/app-state/app-state-slice'
// import configSlice from '@/features/config/config-slice'
// import dataQueriesSlice from '@/features/app-state/data-queries-slice'
import { reactToError, reactToResponse } from "@/features/api/ApiService";

/**
 * Show a toast.
 */
export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (action.type.includes("/fulfilled")) {
    const requiredKeys = ["error", "messages", "ok", "status"];
    const hasRequiredKeys = requiredKeys.every((key) =>
      keys(action.payload).includes(key)
    );

    if (action.payload && hasRequiredKeys) {
      reactToResponse(action.payload);
    }
  }

  if (isRejectedWithValue(action)) {
    reactToError(action.payload);
  }

  return next(action);
};

const store = configureStore({
  reducer: {
    // appState: appStateReducer,
    // dataQueries: dataQueriesSlice,
    // config: configSlice,
    // [appsApiSlice.reducerPath]: appsApiSlice.reducer,
    [dataSourcesApiSlice.reducerPath]: dataSourcesApiSlice.reducer,
    [recordsApiSlice.reducerPath]: recordsApiSlice.reducer,
    [tablesApiSlice.reducerPath]: tablesApiSlice.reducer,
    // [appVersionsApiSlice.reducerPath]: appVersionsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // appsApiSlice.middleware,
      dataSourcesApiSlice.middleware,
      recordsApiSlice.middleware,
      tablesApiSlice.middleware,
      // appVersionsApiSlice.middleware,
      rtkQueryErrorLogger
    ),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

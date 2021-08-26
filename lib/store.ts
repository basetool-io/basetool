import {
  Middleware,
  configureStore,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import { dataSourcesApiSlice } from "@/features/data-sources/api-slice";
import { keys } from "lodash";
import { reactToError, reactToResponse } from "@/features/api/ApiService";
import { recordsApiSlice } from "@/features/records/records-api-slice";
import { tablesApiSlice } from "@/features/tables/tables-api-slice";

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
    [dataSourcesApiSlice.reducerPath]: dataSourcesApiSlice.reducer,
    [recordsApiSlice.reducerPath]: recordsApiSlice.reducer,
    [tablesApiSlice.reducerPath]: tablesApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      dataSourcesApiSlice.middleware,
      recordsApiSlice.middleware,
      tablesApiSlice.middleware,
      rtkQueryErrorLogger
    ),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

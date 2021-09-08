import {
  Middleware,
  configureStore,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import { dataSourcesApiSlice } from "@/features/data-sources/api-slice";
import { keys } from "lodash";
import { reactToError, reactToResponse } from "@/features/api/ApiService";
import { recordsApiSlice } from "@/features/records/api-slice";
import { tablesApiSlice } from "@/features/tables/api-slice";
import { toast } from "react-toastify"
import recordsReducer from "@/features/records/state-slice";

/**
 * Show a toast.
 */
export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  // Added for when fetching the data fails with 500
  if (action.type.includes("/rejected") && action?.payload?.originalStatus && action?.payload?.originalStatus === 500) {
    toast.error(action.payload.error)
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

  if (isRejectedWithValue(action)) {
    reactToError(action.payload);
  }

  return next(action);
};

const store = configureStore({
  reducer: {
    recordsState: recordsReducer,
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

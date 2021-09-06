import { IFilter } from "@/features/tables/components/Filter";
import { OrderDirection } from "../tables/types";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";

interface AppState {
  records: [];
  filters: IFilter[];
  appliedFilters: IFilter[];
  orderBy: string;
  orderDirection: OrderDirection;
  filtersPanelVisible: boolean;
}

const initialState: AppState = {
  records: [],
  filters: [],
  appliedFilters: [],
  orderBy: "",
  orderDirection: "",
  filtersPanelVisible: false,
};

const recordsStateSlice = createSlice({
  name: "recordsState",
  initialState,
  reducers: {
    resetState() {
      return initialState;
    },

    /* Filters */
    addFilter(state, action: PayloadAction<IFilter>) {
      state.filters.push(action.payload);
    },
    setFilters(state, action: PayloadAction<IFilter[]>) {
      state.filters = [...action.payload];
    },
    setAppliedFilters(state, action: PayloadAction<IFilter[]>) {
      state.appliedFilters = [...action.payload];
    },
    removeFilter(state, action: PayloadAction<number>) {
      state.filters.splice(action.payload, 1);
      state.appliedFilters.splice(action.payload, 1);
    },
    updateFilter(
      state,
      action: PayloadAction<{ idx: number; filter: IFilter }>
    ) {
      const { idx, filter } = action.payload;
      state.filters[idx] = filter;
    },
  },
});

// export const testSelector = () => {
//   console.log('api!->', recordsApiSlice.endpoints)
//   const p = recordsApiSlice.endpoints.getRecords.select({dataSourceId: '8', tableName: 'teams'})
//   console.log('p->', p)
//   // api.endpoints
//   return p
// };
export const filtersSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.filters;
export const appliedFiltersSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) => recordsState.appliedFilters;
export const allFiltersAppliedSelector = createSelector(
  [filtersSelector, appliedFiltersSelector],
  (filters, appliedFilters) =>
    JSON.stringify(filters) === JSON.stringify(appliedFilters)
);

export const {
  resetState,
  addFilter,
  setFilters,
  setAppliedFilters,
  removeFilter,
  updateFilter,
} = recordsStateSlice.actions;

export default recordsStateSlice.reducer;

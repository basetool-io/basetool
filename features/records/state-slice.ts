import { IFilter, IFilterGroup } from "@/features/tables/components/Filter";
import { OrderDirection } from "../tables/types";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";

interface AppState {
  records: [];
  filters: Array<IFilter | IFilterGroup>;
  appliedFilters: Array<IFilter | IFilterGroup>;
  orderBy: string;
  orderDirection: OrderDirection;
  filtersPanelVisible: boolean;
  selectedRecords: number[];
}

const initialState: AppState = {
  records: [],
  filters: [],
  appliedFilters: [],
  orderBy: "",
  orderDirection: "",
  filtersPanelVisible: false,
  selectedRecords: [],
};

const recordsStateSlice = createSlice({
  name: "recordsState",
  initialState,
  reducers: {
    resetState() {
      return initialState;
    },

    /* Filters */
    addFilter(state, action: PayloadAction<IFilter | IFilterGroup>) {
      state.filters.push(action.payload);
    },
    setFilters(state, action: PayloadAction<Array<IFilter | IFilterGroup>>) {
      state.filters = [...action.payload];
    },
    setAppliedFilters(state, action: PayloadAction<Array<IFilter | IFilterGroup>>) {
      state.appliedFilters = [...action.payload];
    },
    removeFilter(state, action: PayloadAction<number>) {
      state.filters.splice(action.payload, 1);
      state.appliedFilters.splice(action.payload, 1);
    },
    updateFilter(
      state,
      action: PayloadAction<{ idx: number; filter: IFilter | IFilterGroup }>
    ) {
      const { idx, filter } = action.payload;
      //change all filters to the value set by idx 1
      if(idx === 1) {
        state.filters.forEach((f) => {
          f.verb = filter.verb;
        });
      }
      state.filters[idx] = filter;
    },
    toggleRecordSelection(state, action: PayloadAction<number>) {
      const index = state.selectedRecords.indexOf(action.payload);
      if(index >= 0) {
        state.selectedRecords.splice(index, 1);
      } else {
        state.selectedRecords.push(action.payload);
      }
    },
    setRecordsSelected(state, action: PayloadAction<number[]>) {
      state.selectedRecords = action.payload;
    },
    resetRecordsSelection(state) {
      state.selectedRecords = [];
    },
  },
});

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

export const selectedRecordsSelector = ({ recordsState }: { recordsState: AppState }) => recordsState.selectedRecords;

export const {
  resetState,
  addFilter,
  setFilters,
  setAppliedFilters,
  removeFilter,
  updateFilter,
  toggleRecordSelection,
  setRecordsSelected,
  resetRecordsSelection,
} = recordsStateSlice.actions;

export default recordsStateSlice.reducer;

import { Column } from "../fields/types";
import { IFilter, IFilterGroup } from "@/features/tables/components/Filter";
import { OrderDirection } from "../tables/types";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";

interface AppState {
  records: [];
  meta: Record<string, unknown>;
  columns: Column[];
  filters: Array<IFilter | IFilterGroup>;
  appliedFilters: Array<IFilter | IFilterGroup>;
  orderBy: string;
  orderDirection: OrderDirection;
  filtersPanelVisible: boolean;
  selectedRecords: number[];
  columnWidths: Record<string, number>;
}

const initialState: AppState = {
  records: [],
  meta: {},
  columns: [],
  filters: [],
  appliedFilters: [],
  orderBy: "",
  orderDirection: "",
  filtersPanelVisible: false,
  selectedRecords: [],
  columnWidths: {},
};

const recordsStateSlice = createSlice({
  name: "recordsState",
  initialState,
  reducers: {
    resetState() {
      return initialState;
    },

    /**
     * Filters
     */
    addFilter(state, action: PayloadAction<IFilter | IFilterGroup>) {
      state.filters.push(action.payload);
    },
    setFilters(state, action: PayloadAction<Array<IFilter | IFilterGroup>>) {
      state.filters = [...action.payload];
    },
    setAppliedFilters(
      state,
      action: PayloadAction<Array<IFilter | IFilterGroup>>
    ) {
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
      if (idx === 1) {
        state.filters.forEach((f) => {
          f.verb = filter.verb;
        });
      }
      state.filters[idx] = filter;
    },

    /**
     * Records selection
     */
    setRecordsSelected(state, action: PayloadAction<number[]>) {
      state.selectedRecords = action.payload;
    },
    resetRecordsSelection(state) {
      state.selectedRecords = [];
    },
    toggleRecordSelection(state, action: PayloadAction<number>) {
      const index = state.selectedRecords.indexOf(action.payload);
      if (index >= 0) {
        state.selectedRecords.splice(index, 1);
      } else {
        state.selectedRecords.push(action.payload);
      }
    },

    /**
     * Records
     */
    setRecords(state, action: PayloadAction<[]>) {
      state.records = action.payload;
    },

    /**
     * Meta
     */
    setMeta(state, action: PayloadAction<Record<string, unknown>>) {
      state.meta = action.payload;
    },

    /**
     * Columns
     */
    setColumns(state, action: PayloadAction<Column[]>) {
      state.columns = action.payload;
    },

    /**
     * Order
     */
    setOrderBy(state, action: PayloadAction<string>) {
      state.orderBy = action.payload;
    },
    setOrderDirection(state, action: PayloadAction<OrderDirection>) {
      state.orderDirection = action.payload;
    },

    /**
     * ColumnWidths
     */
    setColumnWidths(state, action: PayloadAction<Record<string, number>>) {
      state.columnWidths = action.payload;
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
export const recordsSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.records;
export const metaSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.meta;
export const columnsSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.columns;
export const columnWidthsSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) => recordsState.columnWidths;
export const orderSelector = ({ recordsState }: { recordsState: AppState }) => [
  recordsState.orderBy,
  recordsState.orderDirection,
];
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

export const selectedRecordsSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) => recordsState.selectedRecords;

export const allColumnsCheckedSelector = createSelector(
  [recordsSelector, selectedRecordsSelector],
  (records, selectedRecords): boolean =>
    records.length === selectedRecords.length && records.length > 0
);

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
  setColumns,

  setRecords,

  setMeta,

  setOrderBy,
  setOrderDirection,

  setColumnWidths,
} = recordsStateSlice.actions;

export default recordsStateSlice.reducer;

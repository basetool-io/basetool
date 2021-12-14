import { Column } from "../fields/types";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { IFilter, IFilterGroup, OrderDirection } from "../tables/types";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { encodeObject } from "@/lib/encoding";
import { first, isEmpty, last } from "lodash";

interface AppState {
  records: [];
  meta: Record<string, string | number | boolean | null>;
  columns: Column[];
  activeColumnName: Column["name"];
  filters: Array<IFilter | IFilterGroup>;
  appliedFilters: Array<IFilter | IFilterGroup>;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: OrderDirection;
  filtersPanelVisible: boolean;
  selectedRecords: number[];
  columnWidths: Record<string, number>;
  activeWidgetName: string;
}

const initialState: AppState = {
  records: [],
  meta: {},
  columns: [],
  activeColumnName: "",
  filters: [],
  appliedFilters: [],
  page: 1,
  perPage: DEFAULT_PER_PAGE,
  orderBy: "",
  orderDirection: "",
  filtersPanelVisible: false,
  selectedRecords: [],
  columnWidths: {},
  activeWidgetName: "",
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
    },
    removeAppliedFilter(state, action: PayloadAction<number>) {
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
    setMeta(
      state,
      action: PayloadAction<Record<string, string | number | boolean | null>>
    ) {
      state.meta = action.payload;
    },

    /**
     * Pagination
     */
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPerPage(state, action: PayloadAction<number>) {
      state.perPage = action.payload;
    },

    /**
     * Columns
     */
    setColumns(state, action: PayloadAction<Column[]>) {
      state.columns = action.payload;
    },
    setActiveColumnName(state, action: PayloadAction<string>) {
      state.activeColumnName = action.payload;
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

    /**
     * Columns
     */
    setActiveWidgetName(state, action: PayloadAction<string>) {
      state.activeWidgetName = action.payload;
    },
  },
});

export const {
  resetState,
  addFilter,
  setFilters,
  setAppliedFilters,
  removeFilter,
  removeAppliedFilter,
  updateFilter,
  toggleRecordSelection,
  setRecordsSelected,
  resetRecordsSelection,
  setColumns,
  setActiveColumnName,

  setRecords,

  setMeta,

  setPerPage,
  setPage,

  setOrderBy,
  setOrderDirection,

  setColumnWidths,

  setActiveWidgetName,
} = recordsStateSlice.actions;

export default recordsStateSlice.reducer;

export const metaSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.meta;
export const columnsSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.columns;
export const activeColumnSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) =>
  recordsState.columns.find((c) => c.name === recordsState.activeColumnName);
export const activeColumnNameSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) => recordsState.activeColumnName;
export const columnWidthsSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) => recordsState.columnWidths;
export const orderBySelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.orderBy;
export const orderDirectionSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) => recordsState.orderDirection;

/**
 * Records
 */
export const recordsSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.records;
export const firstRecordIdSelector = createSelector(
  [recordsSelector],
  (records): string | undefined =>
    records.length > 0 ? (first(records) as any)?.id : undefined
);
export const lastRecordIdSelector = createSelector(
  [recordsSelector],
  (records): string | undefined =>
    records.length > 0 ? (last(records) as any)?.id : undefined
);

/**
 * Selection
 */
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

/**
 * Filters
 */
export const filtersSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.filters;
export const appliedFiltersSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) => recordsState.appliedFilters;

export const encodedFiltersSelector = createSelector(
  [appliedFiltersSelector],
  (appliedFilters) =>
    isEmpty(appliedFilters) ? "" : encodeObject(appliedFilters)
);
export const allFiltersAppliedSelector = createSelector(
  [filtersSelector, appliedFiltersSelector],
  (filters, appliedFilters) =>
    JSON.stringify(filters) === JSON.stringify(appliedFilters)
);

/**
 * Pagination
 */
export const pageSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.page;
export const perPageSelector = ({ recordsState }: { recordsState: AppState }) =>
  recordsState.perPage;
export const limitOffsetSelector = createSelector(
  [pageSelector, perPageSelector],
  (page, perPage) => {
    const limit: number = perPage;
    const offset = page === 1 ? 0 : (page - 1) * limit;

    return [limit, offset];
  }
);

/**
 * Widgets
 */
export const activeWidgetNameSelector = ({
  recordsState,
}: {
  recordsState: AppState;
}) => recordsState.activeWidgetName;

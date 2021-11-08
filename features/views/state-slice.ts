import { Column } from "../fields/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { merge } from "lodash"

interface AppState {
  columns: Column[];
  selectedColumnName: string;
}

const initialState: AppState = {
  columns: [],
  selectedColumnName: "",
};

const viewsState = createSlice({
  name: "viewsState",
  initialState,
  reducers: {
    resetState() {
      return initialState;
    },

    /**
     * Columns
     */
    setColumns(state, action: PayloadAction<Column[]>) {
      state.columns = action.payload;
    },
    selectColumnName(state, action: PayloadAction<string>) {
      state.selectedColumnName = action.payload;
    },
    updateColumn(
      state,
      action: PayloadAction<{
        columnName: string;
        payload: Record<string, unknown>;
      }>
    ) {
      const { columnName, payload } = action.payload;
      const index = state.columns.findIndex(
        (column) => column.name === columnName
        );

      console.log('columnName, payload->', index, columnName, payload, ({...state.columns[index]}))
      if (index) {
        state.columns[index] = merge({...state.columns[index]}, payload);
      }
    },
  },
});

export const {
  resetState,

  setColumns,
  selectColumnName,
  updateColumn,
} = viewsState.actions;

export default viewsState.reducer;

/**
 * Columns
 */
export const columnsSelector = ({ viewsState }: { viewsState: AppState }) =>
  viewsState.columns;
export const selectedColumnNameSelector = ({
  viewsState,
}: {
  viewsState: AppState;
}) => viewsState.selectedColumnName;
export const activeColumnSelector = ({
  viewsState,
}: {
  viewsState: AppState;
}) =>
  viewsState.columns.find(
    (column) => column.name === viewsState.selectedColumnName
  );

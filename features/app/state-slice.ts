import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AppState {
  sidebarsVisible: boolean;

  dataSourceId: string;
  tableName: string;
}

const initialState: AppState = {
  sidebarsVisible: false,

  dataSourceId: '',
  tableName: '',
};

const appStateSlice = createSlice({
  name: "appState",
  initialState,
  reducers: {
    resetState() {
      return initialState;
    },

    /* Sidebars */
    setSidebarVisibile(state, action: PayloadAction<boolean>) {
      state.sidebarsVisible = action.payload;
    },

    setDataSourceId(state, action: PayloadAction<string>) {
      state.dataSourceId = action.payload;
    },

    setTableName(state, action: PayloadAction<string>) {
      state.tableName = action.payload;
    },
  },
});

export const sidebarsVisibleSelector = ({ appState }: { appState: AppState }) =>
  appState.sidebarsVisible;

export const dataSourceIdSelector = ({ appState }: { appState: AppState }) =>
  appState.dataSourceId;

export const tableNameSelector = ({ appState }: { appState: AppState }) =>
  appState.tableName;

export const { resetState, setSidebarVisibile, setDataSourceId, setTableName } = appStateSlice.actions;

export default appStateSlice.reducer;

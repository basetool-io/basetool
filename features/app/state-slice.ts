import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AppState {
  sidebarsVisible: boolean;

  dataSourceId: string;
  tableName: string;
}

const initialState: AppState = {
  sidebarsVisible: false,

  dataSourceId: "",
  tableName: "",
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


    /* Store info about Datasource and Table */
    setDataSourceId(state, action: PayloadAction<string>) {
      state.dataSourceId = action.payload;
    },
    // resetDataSourceId(state) {
    //   state.dataSourceId = "";
    // },
    setTableName(state, action: PayloadAction<string>) {
      state.tableName = action.payload;
    },
    // resetTableName(state) {
    //   state.tableName = "";
    // },
  },
});

export const sidebarsVisibleSelector = ({ appState }: { appState: AppState }) => appState.sidebarsVisible

export const dataSourceIdSelector = ({ appState }: { appState: AppState }) => appState.dataSourceId;
export const tableNameSelector = ({ appState }: { appState: AppState }) => appState.tableName;

export const {
  resetState,
  setSidebarVisibile,
  setDataSourceId,
  setTableName,
} = appStateSlice.actions;

export default appStateSlice.reducer;

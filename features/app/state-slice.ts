import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AppState {
  sidebarsVisible: boolean;
}

const initialState: AppState = {
  sidebarsVisible: false,
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
  },
});

export const sidebarsVisibleSelector = ({ appState }: { appState: AppState }) =>
  appState.sidebarsVisible;

export const { resetState, setSidebarVisibile } = appStateSlice.actions;

export default appStateSlice.reducer;

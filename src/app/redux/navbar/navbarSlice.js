import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  navbarOpen: false,
};

const uiSlice = createSlice({
  name: "navbar",
  initialState,
  reducers: {
    toggleNavbar(state) {
      state.navbarOpen = !state.navbarOpen;
    },
    openNavbar(state) {
      state.navbarOpen = true;
    },
    closeNavbar(state) {
      state.navbarOpen = false;
    },
  },
});

export const { toggleNavbar, openNavbar, closeNavbar } = uiSlice.actions;
export const selectNavbarOpen = (state) => state.ui.navbarOpen;

export default uiSlice.reducer;
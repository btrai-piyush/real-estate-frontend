import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  modalOpen: false,
  modalTab: "login", // 'login' or 'register'
};

const authModalSlice = createSlice({
  name: "authModal",
  initialState,
  reducers: {
    openModal(state) {
      state.modalOpen = true;
    },
    closeModal(state) {
      state.modalOpen = false;
    },
    setModalTab(state, action) {
      state.modalTab = action.payload; // 'login' or 'register'
    },
  },
});

export const { openModal, closeModal, setModalTab } = authModalSlice.actions;
export const selectModalOpen = (state) => state.authModal.modalOpen;
export const selectModalTab = (state) => state.authModal.modalTab;

export default authModalSlice.reducer;
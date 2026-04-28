import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  loading: false,
  error: "",
  hasFetched: false,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.list = Array.isArray(action.payload) ? action.payload : [];
      state.hasFetched = true;
    },
    setMessagesLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMessagesError: (state, action) => {
      state.error = action.payload;
    },
    markMessageAsRead: (state, action) => {
      const messageId = action.payload;
      state.list = state.list.map((message) =>
        message.id === messageId ? { ...message, readStatus: true } : message
      );
    },
    toggleMessageReadStatus: (state, action) => {
      const messageId = action.payload;
      state.list = state.list.map((message) =>
        message.id === messageId
          ? { ...message, readStatus: !Boolean(message.readStatus) }
          : message
      );
    },
    markAllMessagesRead: (state) => {
      state.list = state.list.map((message) => ({ ...message, readStatus: true }));
    },
    deleteMessageById: (state, action) => {
      const messageId = action.payload;
      state.list = state.list.filter((message) => message.id !== messageId);
    },
  },
});

export const {
  setMessages,
  setMessagesLoading,
  setMessagesError,
  markMessageAsRead,
  toggleMessageReadStatus,
  markAllMessagesRead,
  deleteMessageById,
} = messagesSlice.actions;

export const selectMessagesState = (state) => state.messages;
export const selectMessagesList = (state) => selectMessagesState(state).list;
export const selectMessagesLoading = (state) => selectMessagesState(state).loading;
export const selectMessagesError = (state) => selectMessagesState(state).error;
export const selectMessagesHasFetched = (state) => selectMessagesState(state).hasFetched;

export default messagesSlice.reducer;

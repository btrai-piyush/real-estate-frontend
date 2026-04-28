import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./navbar/navbarSlice";
import authModalReducer from "./authModal/authModalSlice";
import appReducer from "./app/appSlice";
import authReducer from "./auth/authSlice";
import propertyReducer from "./property/propertySlice";
import accountingReducer from "./accounting/accountingSlice";
import messagesReducer from "./messages/messagesSlice";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    authModal: authModalReducer,
    app: appReducer,
    property: propertyReducer,
    auth: authReducer,
    accounting: accountingReducer,
    messages: messagesReducer,
  },
});

export default store;
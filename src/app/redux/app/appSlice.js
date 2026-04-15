import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userLocation: {
    lat: null,
    lng: null
  },

  login: {
    form: { email: '', password: '' },
    error: '',
    loading: false,
  },
  register: {
    form: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    error: '',
    loading: false,
  },
  changePassword: {
    form: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    error: '',
    success: '',
    loading: false,
  },
  home: {
    stats: {
      totalUsers: 1234,
      activeSessions: 856,
      newRegistrations: 42,
    },
  },
  idle: {
    showWarning: false,
    remaining: 0,
  },
  location: {
    lat: null,
    lng: null,
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoginField: (state, action) => {
      const { name, value } = action.payload;
      state.login.form[name] = value;
    },
    setLoginError: (state, action) => {
      state.login.error = action.payload;
    },
    setLoginLoading: (state, action) => {
      state.login.loading = action.payload;
    },
    resetLoginForm: (state) => {
      state.login.form = { email: '', password: '' };
    },

    setRegisterField: (state, action) => {
      const { name, value } = action.payload;
      state.register.form[name] = value;
    },
    setRegisterError: (state, action) => {
      state.register.error = action.payload;
    },
    setRegisterLoading: (state, action) => {
      state.register.loading = action.payload;
    },
    resetRegisterForm: (state) => {
      state.register.form = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
      };
    },

    setChangePasswordField: (state, action) => {
      const { name, value } = action.payload;
      state.changePassword.form[name] = value;
    },
    setChangePasswordError: (state, action) => {
      state.changePassword.error = action.payload;
    },
    setChangePasswordSuccess: (state, action) => {
      state.changePassword.success = action.payload;
    },
    setChangePasswordLoading: (state, action) => {
      state.changePassword.loading = action.payload;
    },
    resetChangePasswordForm: (state) => {
      state.changePassword.form = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    },

    setHomeStats: (state, action) => {
      state.home.stats = action.payload;
    },

    setIdleWarning: (state, action) => {
      state.idle.showWarning = action.payload;
    },
    setIdleRemaining: (state, action) => {
      state.idle.remaining = action.payload;
    },
    setUserLocation: (state, action) => {
      const { lat, lng } = action.payload;
      state.location.lat = lat;
      state.location.lng = lng;
    },
  },
});

export const {
  setUserLocation,
  setLoginField,
  setLoginError,
  setLoginLoading,
  resetLoginForm,
  setRegisterField,
  setRegisterError,
  setRegisterLoading,
  resetRegisterForm,
  setChangePasswordField,
  setChangePasswordError,
  setChangePasswordSuccess,
  setChangePasswordLoading,
  resetChangePasswordForm,
  setHomeStats,
  setIdleWarning,
  setIdleRemaining,
} = appSlice.actions;

export default appSlice.reducer;

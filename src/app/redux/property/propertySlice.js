import { createSlice } from '@reduxjs/toolkit';

export const propertyDefaultFilters = {
  keyword: '',
  location: '',
  saleOption: '',
  propertyType: '',
  priceRange: '',
  bathrooms: '',
  bedrooms: '',
  garages: '',
  yearBuilt: '',
  minArea: '',
  maxArea: '',
};

const initialState = {
  list: [],
  loading: true,
  error: '',
  adminList: [],
  adminTotalCount: 0,
  adminLoading: true,
  adminError: '',
  adminHasFetched: false,
  adminQuery: {
    keyword: '',
    filter: 'Recent',
  },
  favorites: [],
  compared: [],
  filters: { ...propertyDefaultFilters },
  appliedFilters: { ...propertyDefaultFilters },
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setPropertyList: (state, action) => {
      state.list = action.payload;
    },
    removePropertyById: (state, action) => {
      state.list = state.list.filter((property) => property.id !== action.payload);
    },
    setPropertyLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPropertyError: (state, action) => {
      state.error = action.payload;
    },
    setAdminPropertyList: (state, action) => {
      const payload = action.payload || {};
      const nextList = Array.isArray(payload.list) ? payload.list : [];

      state.adminList = nextList;
      state.adminTotalCount = Number(payload.totalCount) || nextList.length;
      state.adminQuery = {
        keyword: payload.keyword || '',
        filter: payload.filter || 'Recent',
      };
      state.adminHasFetched = true;
    },
    setAdminPropertyLoading: (state, action) => {
      state.adminLoading = action.payload;
    },
    setAdminPropertyError: (state, action) => {
      state.adminError = action.payload;
    },
    removeAdminPropertyById: (state, action) => {
      const deleteId = action.payload;
      const prevLength = state.adminList.length;
      state.adminList = state.adminList.filter((property) => property.id !== deleteId);

      if (state.adminList.length !== prevLength) {
        state.adminTotalCount = Math.max(0, state.adminTotalCount - 1);
      }
    },
    toggleAdminFeaturedByIds: (state, action) => {
      const ids = new Set(Array.isArray(action.payload) ? action.payload : []);
      state.adminList = state.adminList.map((property) => {
        if (!ids.has(property.id)) {
          return property;
        }

        return {
          ...property,
          isFeatured: !property.isFeatured,
        };
      });
    },
    toggleAdminListingStatusByIds: (state, action) => {
      const ids = new Set(Array.isArray(action.payload) ? action.payload : []);
      state.adminList = state.adminList.map((property) => {
        if (!ids.has(property.id)) {
          return property;
        }

        return {
          ...property,
          listingStatus: !property.listingStatus,
        };
      });
    },
    togglePropertyFavorite: (state, action) => {
      const propertyId = action.payload;
      const exists = state.favorites.includes(propertyId);

      if (exists) {
        state.favorites = state.favorites.filter((id) => id !== propertyId);
      } else {
        state.favorites.push(propertyId);
      }
    },
    togglePropertyCompare: (state, action) => {
      const propertyId = action.payload;
      const exists = state.compared.includes(propertyId);

      if (exists) {
        state.compared = state.compared.filter((id) => id !== propertyId);
      } else {
        state.compared.push(propertyId);
      }
    },
    setPropertyFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetPropertyFilters: (state) => {
      state.filters = { ...propertyDefaultFilters };
    },
    applyPropertyFilters: (state) => {
      state.appliedFilters = { ...state.filters };
    },
  },
});

export const {
  setPropertyList,
  removePropertyById,
  setPropertyLoading,
  setPropertyError,
  setAdminPropertyList,
  setAdminPropertyLoading,
  setAdminPropertyError,
  removeAdminPropertyById,
  toggleAdminFeaturedByIds,
  toggleAdminListingStatusByIds,
  togglePropertyFavorite,
  togglePropertyCompare,
  setPropertyFilters,
  resetPropertyFilters,
  applyPropertyFilters,
} = propertySlice.actions;

export const selectPropertyState = (state) => state.property;
export const selectPropertyList = (state) => selectPropertyState(state).list;
export const selectPropertyLoading = (state) => selectPropertyState(state).loading;
export const selectPropertyError = (state) => selectPropertyState(state).error;
export const selectAdminPropertyList = (state) => selectPropertyState(state).adminList;
export const selectAdminPropertyTotalCount = (state) => selectPropertyState(state).adminTotalCount;
export const selectAdminPropertyLoading = (state) => selectPropertyState(state).adminLoading;
export const selectAdminPropertyError = (state) => selectPropertyState(state).adminError;
export const selectAdminPropertyHasFetched = (state) => selectPropertyState(state).adminHasFetched;
export const selectAdminPropertyQuery = (state) => selectPropertyState(state).adminQuery;
export const selectPropertyFavorites = (state) => selectPropertyState(state).favorites;
export const selectPropertyCompared = (state) => selectPropertyState(state).compared;
export const selectPropertyFilters = (state) => selectPropertyState(state).filters;
export const selectPropertyAppliedFilters = (state) => selectPropertyState(state).appliedFilters;

export default propertySlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEYS = {
  masterGroups: "accounting.masterGroups",
  glGroups: "accounting.glGroups",
  glHeads: "accounting.glHeads",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCollection(key) {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection(key, rows) {
  if (!canUseStorage()) {
    return;
  }

  const safeRows = Array.isArray(rows) ? rows : [];
  window.localStorage.setItem(key, JSON.stringify(safeRows));
}

function createLocalId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

function persistAccountingCollections(state) {
  writeCollection(STORAGE_KEYS.masterGroups, state.masterGroups);
  writeCollection(STORAGE_KEYS.glGroups, state.glGroups);
  writeCollection(STORAGE_KEYS.glHeads, state.glHeads);
}

const initialState = {
  masterGroups: readCollection(STORAGE_KEYS.masterGroups),
  glGroups: readCollection(STORAGE_KEYS.glGroups),
  glHeads: readCollection(STORAGE_KEYS.glHeads),
  branches: [],
  transactions: [],
  loading: false,
  error: null,
};

const accountingSlice = createSlice({
  name: "accounting",
  initialState,
  reducers: {
    setMasterGroups: (state, action) => {
      state.masterGroups = Array.isArray(action.payload) ? action.payload : [];
      persistAccountingCollections(state);
    },

    setGLGroups: (state, action) => {
      state.glGroups = Array.isArray(action.payload) ? action.payload : [];
      persistAccountingCollections(state);
    },

    setGLHeads: (state, action) => {
      state.glHeads = Array.isArray(action.payload) ? action.payload : [];
      persistAccountingCollections(state);
    },

    upsertMasterGroup: (state, action) => {
      const payload = action.payload || {};
      const nextId = payload.id ?? null;
      const normalized = {
        masterGroupName: String(payload.masterGroupName || "").trim(),
        masterGroupNepali: String(payload.masterGroupNepali || "").trim(),
      };

      if (!normalized.masterGroupName) {
        return;
      }

      if (nextId !== null && nextId !== undefined) {
        state.masterGroups = state.masterGroups.map((group) =>
          Number(group.id) === Number(nextId)
            ? { ...group, ...normalized }
            : group
        );
      } else {
        state.masterGroups.push({ id: createLocalId(), ...normalized });
      }

      persistAccountingCollections(state);
    },

    deleteMasterGroup: (state, action) => {
      const masterGroupId = Number(action.payload);

      state.masterGroups = state.masterGroups.filter(
        (group) => Number(group.id) !== masterGroupId
      );

      const removedGroupIds = new Set(
        state.glGroups
          .filter((group) => Number(group.masterGroupID) === masterGroupId)
          .map((group) => Number(group.id))
      );

      if (removedGroupIds.size > 0) {
        state.glGroups = state.glGroups.filter(
          (group) => !removedGroupIds.has(Number(group.id))
        );
        state.glHeads = state.glHeads.filter(
          (head) => !removedGroupIds.has(Number(head.groupID))
        );
      }

      persistAccountingCollections(state);
    },

    upsertGLGroup: (state, action) => {
      const payload = action.payload || {};
      const nextId = payload.id ?? null;
      const normalized = {
        masterGroupID: Number(payload.masterGroupID),
        groupCode: String(payload.groupCode || "").trim(),
        groupName: String(payload.groupName || "").trim(),
        groupNepali: String(payload.groupNepali || "").trim(),
        killed: Boolean(payload.killed),
        hidden: Boolean(payload.hidden),
      };

      if (!normalized.masterGroupID || !normalized.groupCode || !normalized.groupName) {
        return;
      }

      if (nextId !== null && nextId !== undefined) {
        state.glGroups = state.glGroups.map((group) =>
          Number(group.id) === Number(nextId)
            ? { ...group, ...normalized }
            : group
        );
      } else {
        state.glGroups.push({ id: createLocalId(), ...normalized });
      }

      persistAccountingCollections(state);
    },

    deleteGLGroup: (state, action) => {
      const groupId = Number(action.payload);

      state.glGroups = state.glGroups.filter(
        (group) => Number(group.id) !== groupId
      );
      state.glHeads = state.glHeads.filter(
        (head) => Number(head.groupID) !== groupId
      );

      persistAccountingCollections(state);
    },

    upsertGLHead: (state, action) => {
      const payload = action.payload || {};
      const nextId = payload.id ?? null;
      const normalized = {
        branchID: Number(payload.branchID),
        masterGroupID: Number(payload.masterGroupID),
        groupID: Number(payload.groupID),
        glName: String(payload.glName || "").trim(),
        glNameNepali: String(payload.glNameNepali || "").trim(),
        openingBal: Number(payload.openingBal) || 0,
        openingShareAmount: Number(payload.openingShareAmount) || 0,
        openingShareQty: Number(payload.openingShareQty) || 0,
        killed: Boolean(payload.killed),
        hidden: Boolean(payload.hidden),
        locked: Boolean(payload.locked),
        isSys: Boolean(payload.isSys),
        isShare: Boolean(payload.isShare),
        isBank: Boolean(payload.isBank),
        address: String(payload.address || "").trim(),
        contact: String(payload.contact || "").trim(),
        sex: Number(payload.sex) || 0,
        shareHolder: String(payload.shareHolder || "").trim(),
      };

      if (!normalized.branchID || !normalized.groupID || !normalized.glName) {
        return;
      }

      if (nextId !== null && nextId !== undefined) {
        state.glHeads = state.glHeads.map((head) =>
          Number(head.id) === Number(nextId)
            ? { ...head, ...normalized }
            : head
        );
      } else {
        state.glHeads.push({ id: createLocalId(), ...normalized });
      }

      persistAccountingCollections(state);
    },

    deleteGLHead: (state, action) => {
      const headId = Number(action.payload);

      state.glHeads = state.glHeads.filter(
        (head) => Number(head.id) !== headId
      );

      persistAccountingCollections(state);
    },

    setBranchesList: (state, action) => {
      state.branches = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const {
  setMasterGroups,
  setGLGroups,
  setGLHeads,
  upsertMasterGroup,
  deleteMasterGroup,
  upsertGLGroup,
  deleteGLGroup,
  upsertGLHead,
  deleteGLHead,
  setBranchesList,
} = accountingSlice.actions;

export const selectAccountingState = (state) => state.accounting;
export const selectMasterGroups = (state) => selectAccountingState(state).masterGroups;
export const selectGLGroups = (state) => selectAccountingState(state).glGroups;
export const selectGLHeads = (state) => selectAccountingState(state).glHeads;
export const selectBranches = (state) => state.accounting.branches;
export default accountingSlice.reducer;
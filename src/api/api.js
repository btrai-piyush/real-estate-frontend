import { getRuntimeConfig } from "@/app/lib/runtime-config";

const resolveBaseUrl = (baseUrl) => {
  if (typeof baseUrl === 'string' && baseUrl.trim()) {
    return baseUrl.trim();
  }

  const runtimeBaseUrl = getRuntimeConfig('API_BASE_URL');
  if (typeof runtimeBaseUrl === 'string' && runtimeBaseUrl.trim()) {
    return runtimeBaseUrl.trim();
  }

  return '';
};

const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';
const REFRESH_ENDPOINT = '/Auth/refresh-token';

let refreshPromise = null;

function normalizeBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  return fallback;
}

function pickFirstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
}

function buildLoginPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return body;
  }

  const identifier = pickFirstDefined(
    body.emailOrUsername,
    body.emailOrUserName,
    body.identifier,
    body.login,
    body.userName,
    body.username,
    body.email,
    body.Email,
  );
  const password = pickFirstDefined(body.password, body.Password);
  const rememberMe = pickFirstDefined(body.rememberMe, body.RememberMe);

  const payload = { ...body };

  if (identifier !== undefined) {
    const normalizedIdentifier = String(identifier).trim();
    const looksLikeEmail = normalizedIdentifier.includes('@');

    payload.emailOrUsername ??= normalizedIdentifier;
    payload.emailOrUserName ??= normalizedIdentifier;
    payload.identifier ??= normalizedIdentifier;
    payload.login ??= normalizedIdentifier;

    if (looksLikeEmail) {
      payload.email ??= normalizedIdentifier;
      payload.Email ??= normalizedIdentifier;
    } else {
      payload.userName ??= normalizedIdentifier;
      payload.UserName ??= normalizedIdentifier;
      payload.username ??= normalizedIdentifier;
    }
  }

  if (password !== undefined) {
    payload.password ??= password;
    payload.Password ??= password;
  }

  // Backend uses request.RememberMe for cookie expiration control.
  payload.rememberMe ??= normalizeBoolean(rememberMe, false);
  payload.RememberMe ??= payload.rememberMe;

  return payload;
}

async function request(path, options = {}, baseUrl) {
  return requestWithAuthRetry(path, options, baseUrl, { skipAuthRetry: false });
}

function notifySessionExpired() {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

async function requestWithAuthRetry(path, options = {}, baseUrl, config = {}) {
  const { skipAuthRetry = false } = config;

  try {
    return await rawRequest(path, options, baseUrl);
  } catch (err) {
    const isAuthRefreshEndpoint = String(path).toLowerCase() === REFRESH_ENDPOINT.toLowerCase();
    if (skipAuthRetry || isAuthRefreshEndpoint || err?.status !== 401) {
      throw err;
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      notifySessionExpired();
      throw err;
    }

    try {
      return await rawRequest(path, options, baseUrl);
    } catch (retryError) {
      if (retryError?.status === 401) {
        notifySessionExpired();
      }
      throw retryError;
    }
  }
}

async function rawRequest(path, options = {}, baseUrl) {
  const resolvedBaseUrl = resolveBaseUrl(baseUrl);
  const requestUrl = `${resolvedBaseUrl}${path}`;
  const hasFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(options.body && !hasFormDataBody ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(requestUrl, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Successful no-content responses are valid for endpoints like logout.
    if (res.status === 204) {
      return null;
    }

    const contentType = res.headers.get('content-type');

    // Always try to parse as JSON first if content-type indicates JSON
    if (contentType?.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || data?.title || `Request failed (${res.status})`;
        const error = new Error(msg);
        error.status = res.status;
        throw error;
      }
      return data;
    }

    // For non-JSON responses, read as text
    const text = await res.text();
    if (!res.ok) {
      const error = new Error(text || `Request failed (${res.status})`);
      error.status = res.status;
      throw error;
    }

    // Accept successful text/empty responses.
    return text || null;
  } catch (err) {
    // Handle network errors or JSON parse errors
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your network connection.');
    }
    throw err;
  }
}

async function authRequest(path, options = {}, config = {}) {
  return requestWithAuthRetry(path, options, undefined, config);
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await authRequest(REFRESH_ENDPOINT, { method: 'POST' }, { skipAuthRetry: true });
        return true;
      } catch (error) {
        if (error?.status === 400 || error?.status === 401 || error?.status === 404) {
          return false;
        }

        throw error;
      }
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export const authApi = {
  login: (body) =>
    authRequest('/Auth/login', { method: 'POST', body: JSON.stringify(buildLoginPayload(body)) }, { skipAuthRetry: true }),

  register: (body) =>
    authRequest('/Auth/register', { method: 'POST', body: JSON.stringify(body) }, { skipAuthRetry: true }),

  logout: () => authRequest('/Auth/logout', { method: 'POST' }),

  refresh: () => authRequest(REFRESH_ENDPOINT, { method: 'POST' }, { skipAuthRetry: true }),

  //   tokenRefresh: (body) =>
  //     authRequest('/Auth/token-refresh', { method: 'POST', body: JSON.stringify(body) }),

  getCurrent: async () => {
    return authRequest('/Auth/me', {}, { skipAuthRetry: true });
  },
};

export const userApi = {

  getByEmail: async (email) => {
    const encodedEmail = encodeURIComponent(email);
    const paths = [
      `/User?email=${encodedEmail}`,
      `/User/GetUserByEmail?email=${encodedEmail}`,
      `/User/get-user-by-email?email=${encodedEmail}`,
    ];

    let lastError;
    for (const path of paths) {
      try {
        return await authRequest(path);
      } catch (error) {
        if (error?.status === 404) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('User profile not found');
  },
}

export const propertyApi = {
  delete: async (ids) => {
    const payload = Array.isArray(ids) ? ids : [ids];
    return await authRequest(`/Property`, {
      method: 'DELETE',
      body: JSON.stringify(payload),
    });
  },

  getAdminAll: async (filters) => {
    try {
      return await request('/Property/admin-get-all', {
        method: 'POST',
        body: JSON.stringify(filters),
      });
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  getAll: async () => {
    try {
      return await request('/Property');
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  getFiltered: async (filters) => {
    try {
      return await request(`/Property/getfiltered`, {
        method: 'POST',
        body: JSON.stringify(filters),
      });
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  getLatestFeatured: async () => {
    try {
      return await request('/Property/featured');
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  getLatestBySaleOption: async (saleOption) => {
    try {
      return await request(`/Property/latest-by-sale-option?saleOption=${encodeURIComponent(saleOption)}`);
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  addProperty: async (propertyData) => {
    const normalizedPayload = {
      ID: Number(propertyData?.ID ?? propertyData?.id ?? 0) || 0,
      Title: propertyData?.Title ?? propertyData?.title,
      Price: propertyData?.Price ?? propertyData?.price,
      Area: propertyData?.Area ?? propertyData?.area,
      City: propertyData?.City ?? propertyData?.city,
      SaleOption: propertyData?.SaleOption ?? propertyData?.saleOption,
      IsFeatured: propertyData?.IsFeatured ?? propertyData?.isFeatured,
      Type: propertyData?.Type ?? propertyData?.type,
      AddedBy: propertyData?.AddedBy ?? propertyData?.addedBy,
      ListingStatus: propertyData?.ListingStatus ?? propertyData?.listingStatus,
      State: propertyData?.State ?? propertyData?.state,
      CoverPhoto: propertyData?.CoverPhoto ?? propertyData?.coverPhoto,
      Address: propertyData?.Address ?? propertyData?.address,
      Latitude: propertyData?.Latitude ?? propertyData?.latitude,
      Longitude: propertyData?.Longitude ?? propertyData?.longitude,
      UpdatedBy: propertyData?.UpdatedBy ?? propertyData?.updatedBy,
    };

    const formData = new FormData();

    Object.entries(normalizedPayload || {}).forEach(([key, value]) => {
      if (key === 'CoverPhoto') {
        if (typeof File !== 'undefined' && value instanceof File) {
          formData.append(key, value);
        }
        return;
      }

      if (value === undefined || value === null) {
        return;
      }

      if (typeof File !== 'undefined' && value instanceof File) {
        formData.append(key, value);
        return;
      }

      formData.append(key, String(value));
    });

    return await request('/Property', {
      method: 'POST',
      body: formData,
    });
  },

  getById: async (propertyId) => {
    if (!propertyId) {
      throw new Error('Property ID is required.');
    }

    const id = encodeURIComponent(String(propertyId));
    const paths = [
      `/Property/${id}`,
      `/Property/get-by-id/${id}`,
    ];

    let lastError;
    for (const path of paths) {
      try {
        return await request(path);
      } catch (error) {
        if (error?.status === 404) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('Property not found.');
  },

  updateProperty: async (propertyId, propertyData) => {
    if (!propertyId) {
      throw new Error('Property ID is required for update.');
    }

    const normalizedPayload = {
      ID: Number(propertyData?.ID ?? propertyData?.id ?? propertyId) || propertyId,
      Title: propertyData?.Title ?? propertyData?.title,
      Price: propertyData?.Price ?? propertyData?.price,
      Area: propertyData?.Area ?? propertyData?.area,
      City: propertyData?.City ?? propertyData?.city,
      SaleOption: propertyData?.SaleOption ?? propertyData?.saleOption,
      IsFeatured: propertyData?.IsFeatured ?? propertyData?.isFeatured,
      Type: propertyData?.Type ?? propertyData?.type,
      AddedBy: propertyData?.AddedBy ?? propertyData?.addedBy,
      ListingStatus: propertyData?.ListingStatus ?? propertyData?.listingStatus,
      State: propertyData?.State ?? propertyData?.state,
      CoverPhoto: propertyData?.CoverPhoto ?? propertyData?.coverPhoto,
      Address: propertyData?.Address ?? propertyData?.address,
      Latitude: propertyData?.Latitude ?? propertyData?.latitude,
      Longitude: propertyData?.Longitude ?? propertyData?.longitude,
      UpdatedBy: propertyData?.UpdatedBy ?? propertyData?.updatedBy,
    };

    const formData = new FormData();
    Object.entries(normalizedPayload || {}).forEach(([key, value]) => {
      if (key === 'CoverPhoto') {
        if (typeof File !== 'undefined' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, 'null');
        }
        return;
      }

      if (value === undefined || value === null) {
        return;
      }

      if (typeof File !== 'undefined' && value instanceof File) {
        formData.append(key, value);
        return;
      }

      formData.append(key, String(value));
    });

    return request('/Property', {
      method: 'PUT',
      body: formData,
    });
  },

  uploadCoverPhoto: async (propertyId, file) => {
    const formData = new FormData();
    formData.append('coverPhoto', file);
    return await request(`/Property/${propertyId}/cover-photo`, {
      method: 'POST',
      body: formData,
    });
  },

  uploadPropertyImage: async ({ file, propertyId, propertyName, propertyCity }) => {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('PropertyId', String(propertyId));
    formData.append('PropertyName', propertyName || 'Property');
    formData.append('PropertyCity', propertyCity || 'Unknown');

    return await request('/Property/upload-image', {
      method: 'POST',
      body: formData,
    });
  },

  deleteProperty: async (propertyIds) => {
    const promises = propertyIds.map((id) => request(`/Property/${id}`, {
      method: 'DELETE',
    }));
    return Promise.all(promises);
  },

  toggleFeatured: async (ids) => {
    const payload = Array.isArray(ids) ? ids : [ids];
    return request('/Property/toggle-featured', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  toggleListingStatus: async (ids) => {
    const payload = Array.isArray(ids) ? ids : [ids];
    return request('/Property/toggle-listing-status', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
}

export const branchApi = {
  createBranch: async (payload) => {
    return await request('/Accounting/Branch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteBranch: async (branchId) => {
    if (branchId === undefined || branchId === null || branchId === '') {
      throw new Error('Branch ID is required to delete a branch.');
    }

    const encodedId = encodeURIComponent(String(branchId));

    const attempts = [
      () => request(`/Accounting/Branch/${encodedId}`, { method: 'DELETE' }),
      () => request(`/Accounting/Branch?id=${encodedId}`, { method: 'DELETE' }),
      () => request('/Accounting/Branch', { method: 'DELETE', body: JSON.stringify({ id: branchId }) }),
      () => request('/Accounting/Branch', { method: 'DELETE', body: JSON.stringify(branchId) }),
      () => request('/Accounting/Branch', { method: 'DELETE', body: JSON.stringify([branchId]) }),
    ];

    let lastError;
    for (const attempt of attempts) {
      try {
        return await attempt();
      } catch (error) {
        if (error?.status === 400 || error?.status === 404 || error?.status === 405 || error?.status === 415) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('Failed to delete branch.');
  },

  getBranches: async () => {
    try {
      return await request('/Accounting/Branches');
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  getAll: async () => {
    return branchApi.getBranches();
  }
};

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export const accountingApi = {
  getMasterGroups: async () => {
    try {
      const payload = await request('/Accounting/MasterGroups');
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  createMasterGroup: async (payload = {}) => {
    const body = {
      masterGroupName: String(payload.masterGroupName || '').trim(),
      masterGroupNepali: String(payload.masterGroupNepali || '').trim(),
    };

    if (payload.id !== undefined && payload.id !== null) {
      body.id = toNumber(payload.id, 0);
    }

    return await request('/Accounting/MasterGroup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getGLGroups: async () => {
    try {
      const payload = await request('/Accounting/GLGroups');
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  createGLGroup: async (payload = {}) => {
    const body = {
      masterGroupID: toNumber(payload.masterGroupID),
      groupCode: String(payload.groupCode || '').trim(),
      groupName: String(payload.groupName || '').trim(),
      groupNepali: String(payload.groupNepali || '').trim(),
      killed: Boolean(payload.killed),
      hidden: Boolean(payload.hidden),
    };

    if (payload.id !== undefined && payload.id !== null) {
      body.id = toNumber(payload.id, 0);
    }

    return await request('/Accounting/GLGroup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getGLHeads: async () => {
    try {
      const payload = await request('/Accounting/GLHeads');
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  createGLHead: async (payload = {}) => {
    const now = new Date().toISOString();
    const body = {
      branchID: toNumber(payload.branchID),
      groupID: toNumber(payload.groupID),
      creationDate: payload.creationDate || now,
      glName: String(payload.glName || '').trim(),
      glNameNepali: String(payload.glNameNepali || '').trim(),
      openingBal: toNumber(payload.openingBal),
      killed: Boolean(payload.killed),
      hidden: Boolean(payload.hidden),
      locked: Boolean(payload.locked),
      isSys: Boolean(payload.isSys),
      isShare: Boolean(payload.isShare),
      openingShareAmount: toNumber(payload.openingShareAmount),
      openingShareQty: toNumber(payload.openingShareQty),
      address: String(payload.address || '').trim(),
      contact: String(payload.contact || '').trim(),
      sex: toNumber(payload.sex),
      isBank: Boolean(payload.isBank),
      shareHolder: String(payload.shareHolder || '').trim(),
      auditUserID: payload.auditUserID || '',
      entryDate: payload.entryDate || now,
      lastModified: now,
    };

    return await request('/Accounting/GLHead', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  createJournalEntry: async (payload = {}) => {
    const entryDate = payload.entryDate || new Date().toISOString();
    const valueDate = payload.valueDate || entryDate;
    const details = Array.isArray(payload.journalDetails) ? payload.journalDetails : [];

    const body = {
      userID: String(payload.userID || '').trim(),
      entryDate,
      valueDate,
      branchID: toNumber(payload.branchID),
      journalDetails: details.map((detail) => ({
        ledgerID: toNumber(detail?.ledgerID),
        debit: toNumber(detail?.debit),
        credit: toNumber(detail?.credit),
        reference: String(detail?.reference || '').trim(),
        customerID:
          detail?.customerID === undefined || detail?.customerID === null || detail?.customerID === ''
            ? null
            : toNumber(detail?.customerID),
      })),
    };

    return await request('/Accounting/Journal', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  voucherQuery: async (payload = {}) => {
    const body = {};

    const pageNumber = Math.max(toNumber(payload.pageNumber, 1), 1);
    body.pageNumber = pageNumber;

    if (payload.journalID !== undefined && payload.journalID !== null && payload.journalID !== '') {
      const journalID = toNumber(payload.journalID, -1);
      if (journalID > 0) {
        body.journalID = journalID;
      }
    }

    if (payload.fromDate !== undefined && payload.fromDate !== null && payload.fromDate !== '') {
      body.fromDate = String(payload.fromDate);
    }

    if (payload.toDate !== undefined && payload.toDate !== null && payload.toDate !== '') {
      body.toDate = String(payload.toDate);
    }

    try {
      const response = await request('/Accounting/VoucherQuery', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.items)
            ? response.items
            : [];

      const totalCount = extractTotalCount(response, items.length);

      return { items, totalCount };
    } catch (error) {
      if (error?.status === 404) {
        return { items: [], totalCount: 0 };
      }

      throw error;
    }
  },

  verifyJournal: async (payload = {}) => {
    const body = {
      journalID: toNumber(payload.journalID),
    };

    const verifiedValue = payload.verified ?? payload.status;
    if (verifiedValue !== undefined && verifiedValue !== null && verifiedValue !== '') {
      body.verified = toNumber(verifiedValue);
    }

    if (payload.verifiedBy !== undefined && payload.verifiedBy !== null && payload.verifiedBy !== '') {
      body.verifiedBy = String(payload.verifiedBy).trim();
    }

    return await request('/Accounting/VerifyJournal', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },


};

export const commonApi = {
  checkDuplicate: async (payload = {}) => {
    const body = {
      tableName: String(payload.tableName || '').trim(),
      columnName: String(payload.columnName || '').trim(),
      value: String(payload.value || '').trim(),
    };

    if (payload.id !== undefined && payload.id !== null) {
      body.id = toNumber(payload.id, 0);
    }

    return await request('/Common/name-exists', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
}

function looksLikeContactMessage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const keys = new Set(Object.keys(value).map((key) => String(key).toLowerCase()));
  const identityKeys = ['name', 'email', 'phone', 'company', 'subject'];

  const identityScore = identityKeys.reduce((count, key) => count + (keys.has(key) ? 1 : 0), 0);
  return identityScore >= 2 || (keys.has('name') && keys.has('message'));
}

function parseJsonIfString(value) {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractContactMessages(payload) {
  const queue = [parseJsonIfString(payload)];
  const visited = new Set();

  while (queue.length > 0) {
    const current = parseJsonIfString(queue.shift());
    if (!current || typeof current !== 'object') {
      continue;
    }

    if (Array.isArray(current)) {
      if (current.some(looksLikeContactMessage)) {
        return current;
      }

      for (const item of current) {
        if (item && (typeof item === 'object' || typeof item === 'string')) {
          queue.push(item);
        }
      }

      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (looksLikeContactMessage(current)) {
      return [current];
    }

    const prioritizedKeys = ['data', 'items', 'messages', 'result', 'results', 'value', '$values', 'payload', 'content'];
    for (const key of prioritizedKeys) {
      if (key in current) {
        queue.push(current[key]);
      }
    }

    for (const nestedValue of Object.values(current)) {
      if (nestedValue && (typeof nestedValue === 'object' || typeof nestedValue === 'string')) {
        queue.push(nestedValue);
      }
    }
  }

  return [];
}

function normalizeContactMessage(value, index) {
  const message = value && typeof value === 'object' ? value : {};
  const resolvedId = pickFirstDefined(message.id, message.ID, message.messageId, message.MessageId, index + 1);

  return {
    id: resolvedId,
    name: String(pickFirstDefined(message.name, message.Name, 'Unknown Sender')),
    email: String(pickFirstDefined(message.email, message.Email, '')),
    phone: String(pickFirstDefined(message.phone, message.Phone, '')),
    company: String(pickFirstDefined(message.company, message.Company, 'General')),
    subject: String(pickFirstDefined(message.subject, message.Subject, '(No subject)')),
    message: String(pickFirstDefined(message.message, message.Message, '')),
    readStatus: normalizeBoolean(pickFirstDefined(message.readStatus, message.ReadStatus), false),
    createdOn: pickFirstDefined(
      message.AddedOn,
      message.addedOn,
      message.createdOn,
      message.createdAt,
      message.creationDate,
      message.CreatedOn,
      message.CreatedAt,
      message.CreationDate,
      message.date,
      message.Date,
      null,
    ),
  };
}

function extractTotalCount(payload, fallback = 0) {
  if (!payload) return fallback;

  const directCount = pickFirstDefined(payload.totalCount, payload.TotalCount, payload.count, payload.Count);
  const numericDirect = Number(directCount);
  if (Number.isFinite(numericDirect) && numericDirect >= 0) {
    return numericDirect;
  }

  if (Array.isArray(payload) && payload.length > 0) {
    const arrayCount = pickFirstDefined(
      payload[0]?.totalCount,
      payload[0]?.TotalCount,
      payload[0]?.count,
      payload[0]?.Count,
    );
    const numericArray = Number(arrayCount);
    if (Number.isFinite(numericArray) && numericArray >= 0) {
      return numericArray;
    }
  }

  return fallback;
}

function serializeMessageIds(messageIds) {
  const values = Array.isArray(messageIds) ? messageIds : [messageIds];
  const seen = new Set();
  const normalized = [];

  for (const id of values) {
    if (id === undefined || id === null) {
      continue;
    }

    const token = String(id).trim();
    if (!token || seen.has(token)) {
      continue;
    }

    seen.add(token);
    normalized.push(token);
  }

  return normalized.join(',');
}

export const contactApi = {
  sendUserMessage: async (payload = {}) => {
    const body = {
      name: String(payload.name || '').trim(),
      email: String(payload.email || '').trim(),
      phone: String(payload.phone || '').trim(),
      company: String(payload.company || '').trim(),
      subject: String(payload.subject || '').trim(),
      message: String(payload.message || '').trim(),
    };

    return await request('/Contact/user-message', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getMessages: async (pageNumber = 1) => {
    try {
      const pageValue = Math.max(toNumber(pageNumber, 1), 1);
      const response = await request(`/Contact/messages?pageNumber=${pageValue}`);
      const extractedMessages = extractContactMessages(response);
      const items = extractedMessages.map((message, index) => normalizeContactMessage(message, index));
      const totalCount = extractTotalCount(response, items.length);

      return { items, totalCount };
    } catch (err) {
      if (err?.status === 404) {
        return { items: [], totalCount: 0 };
      }
      throw err;
    }
  },

  getOfficeContact: async () => {
    try {
      return await request('/Contact/office-contact');
    } catch (err) {
      if (err?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  toggleReadStatus: async (messageIds) => {
    const payload = serializeMessageIds(messageIds);

    return await request('/Contact/toggle-read-status', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  markAllRead: async (messageIds) => {
    const payload = serializeMessageIds(messageIds);

    return await request('/Contact/mark-all-read', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteMessages: async (messageIds) => {
    const payload = serializeMessageIds(messageIds);

    return await request('/Contact/messages', {
      method: 'DELETE',
      body: JSON.stringify(payload),
    });
  },
}
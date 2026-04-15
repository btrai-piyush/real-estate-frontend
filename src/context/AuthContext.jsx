'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearSession, setSession } from '@/app/redux/auth/authSlice';
import { authApi, userApi } from '@/api/api';

const AuthContext = createContext(null);
const AUTH_USER_STORAGE_KEY = 'realestate.auth.user';

function readStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed || null;
  } catch {
    return null;
  }
}

function hasAdminRole(user) {
  const role = user?.roleID ?? user?.roleId ?? user?.role;
  const roleLabel = user?.roleLabel || user?.roleName || '';

  if (typeof role === 'number') {
    return role === 1;
  }

  if (typeof role === 'string') {
    const normalizedRole = role.trim().toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'administrator') {
      return true;
    }
    if (normalizedRole === '1') return true;
    if (normalizedRole === '0') return false;
  }

  const normalizedRoleLabel = roleLabel.trim().toLowerCase();
  return normalizedRoleLabel === 'admin' || normalizedRoleLabel === 'administrator';
}

function extractUser(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (payload.user) return payload.user;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  if (payload.roleID !== undefined || payload.roleId !== undefined || payload.role !== undefined) {
    return payload;
  }
  return null;
}

function extractEmail(payload) {
  if (!payload) return null;
  if (typeof payload === 'string' && payload.includes('@')) return payload;

  return (
    payload.email ||
    payload.user?.email ||
    payload.data?.email ||
    payload.profile?.email ||
    null
  );
}

function extractCurrentUser(payload) {
  const currentUser = extractUser(payload);
  if (!currentUser) return null;

  const email = extractEmail(currentUser);
  const role = currentUser.role ?? currentUser.Role ?? currentUser.roleName ?? currentUser.roleLabel;
  const userId =
    currentUser.userId ??
    currentUser.userID ??
    currentUser.id ??
    currentUser.ID ??
    currentUser.nameIdentifier;

  if (!email && !userId) return null;

  return {
    ...currentUser,
    userId: userId ?? null,
    id: currentUser.id ?? currentUser.ID ?? userId ?? null,
    email: email ?? null,
    role: role ?? null,
  };
}

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSessionExpired = () => {
      dispatch(clearSession());
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [dispatch]);

  useEffect(() => {
    if (user || typeof window === 'undefined') {
      return;
    }

    const rememberedUser = readStoredUser();
    if (rememberedUser) {
      dispatch(setSession({ user: rememberedUser }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      setIsBootstrapping(true);

      try {
        let meResponse;

        try {
          meResponse = await authApi.getCurrent();
        } catch {
          let refreshed = false;
          try {
            await authApi.refresh();
            refreshed = true;
          } catch {
            refreshed = false;
          }

          if (!refreshed) {
            dispatch(clearSession());
            return;
          }

          try {
            meResponse = await authApi.getCurrent();
          } catch {
            dispatch(clearSession());
            return;
          }
        }

        const currentUser = extractCurrentUser(meResponse);
        if (!currentUser) {
          dispatch(clearSession());
          return;
        }

        let userData = currentUser;

        if (currentUser.email) {
          try {
            const profile = extractUser(await userApi.getByEmail(currentUser.email));
            if (profile) {
              userData = {
                ...currentUser,
                ...profile,
                email: extractEmail(profile) ?? currentUser.email,
                role: profile.role ?? profile.roleName ?? profile.roleLabel ?? currentUser.role,
                userId:
                  profile.userId ??
                  profile.userID ??
                  profile.id ??
                  profile.ID ??
                  currentUser.userId,
              };
            }
          } catch {
            // Keep /Auth/me user payload if profile fetch fails.
          }
        }

        if (userData) {
          dispatch(setSession({ user: userData }));
        } else {
          dispatch(clearSession());
        }
      } catch {
        // Fail closed if auth status cannot be verified.
        dispatch(clearSession());
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const login = (userData) => {
    dispatch(setSession({ user: userData }));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API failures and still clear local session.
    } finally {
      dispatch(clearSession());
    }
  };


  const isAdmin = () => hasAdminRole(user);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isAdmin, isBootstrapping }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

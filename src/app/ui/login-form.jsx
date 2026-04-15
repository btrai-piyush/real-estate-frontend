'use client';

import { useState } from 'react';
import SocialLogins from './social-logins';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi, userApi } from '@/api/api';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetLoginForm,
  setLoginError,
  setLoginField,
  setLoginLoading,
} from '@/app/redux/app/appSlice';

function extractUser(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (payload.user) return payload.user;
  if (payload.result && typeof payload.result === 'object') return payload.result;
  if (payload.data && typeof payload.data === 'object') return payload.data;

  // Ignore message-only responses like { message: "Login successful" }.
  if (
    payload.roleID !== undefined ||
    payload.roleId !== undefined ||
    payload.role !== undefined ||
    payload.email ||
    payload.Email ||
    payload.userName ||
    payload.username ||
    payload.id !== undefined ||
    payload.ID !== undefined
  ) {
    return payload;
  }

  return null;
}

function extractEmail(payload) {
  if (!payload) return null;
  if (typeof payload === 'string' && payload.includes('@')) return payload;

  return (
    payload.email ||
    payload.Email ||
    payload.user?.email ||
    payload.user?.Email ||
    payload.data?.email ||
    payload.data?.Email ||
    payload.result?.email ||
    payload.result?.Email ||
    payload.profile?.email ||
    payload.profile?.Email ||
    null
  );
}

function isAdminUser(user) {
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

export default function LoginForm({ setTab = () => {}, onSuccess = null }) {
  const { login } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const [rememberMe, setRememberMe] = useState(false);
  const form = useSelector((state) => state.app.login.form);
  const error = useSelector((state) => state.app.login.error);
  const loading = useSelector((state) => state.app.login.loading);

  const handleChange = (e) => {
    dispatch(setLoginField({ name: e.target.name, value: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoginError(''));
    dispatch(setLoginLoading(true));

    try {
      // POST /api/Auth/login should set HttpOnly auth cookies.
      await authApi.login({
        email: form.email,
        emailOrUsername: form.email,
        password: form.password,
        rememberMe,
      });

      const meResponse = await authApi.getCurrent();
      const meUser = extractUser(meResponse);

      if (!meUser) {
        throw new Error('Unable to verify session after login.');
      }

      let userData = meUser;
      const meEmail = extractEmail(meUser);

      if (meEmail) {
        try {
          const profile = extractUser(await userApi.getByEmail(meEmail));
          if (profile) {
            userData = {
              ...meUser,
              ...profile,
              email: extractEmail(profile) ?? meEmail,
              role: profile.role ?? profile.roleName ?? profile.roleLabel ?? meUser.role,
            };
          }
        } catch {
          // Keep /Auth/me user when profile enrichment fails.
        }
      }

      if (!userData) {
        throw new Error('Unable to load user profile after login.');
      }

      login(userData);
      dispatch(resetLoginForm());
      setRememberMe(false);

      if (typeof onSuccess === 'function') {
        onSuccess(userData);
      }

      if (isAdminUser(userData)) {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    } catch (err) {
      dispatch(setLoginError(err.message || 'An unexpected error occurred'));
      console.error('Login error:', err);
    } finally {
      dispatch(setLoginLoading(false));
    }
  };

  return (
    <div>
      <SocialLogins mode="login" />

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

        <div className="relative">
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Email or Username"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#dfe4ed] bg-white px-4 py-3 pr-10 text-[15px] text-[#374151] outline-none transition focus:border-[#6b92d4] focus:ring-2 focus:ring-[#6b92d4]/20"
          />
          <svg className="absolute right-3 top-3.5 h-5 w-5 text-[#00788d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div className="relative">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-[#dfe4ed] bg-white px-4 py-3 pr-10 text-[15px] text-[#374151] outline-none transition focus:border-[#6b92d4] focus:ring-2 focus:ring-[#6b92d4]/20"
          />
          <svg className="absolute right-3 top-3.5 h-5 w-5 text-[#00788d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[#4b5563]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[#cbd5e1] text-[#ff5a5f] focus:ring-[#ff5a5f]"
            />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-[14px] text-[#8f8df2] transition hover:text-[#7170d8]">Lost your password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-[#ff5a5f] py-3.5 text-[19px] font-semibold text-white transition hover:bg-[#ff474d] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : null}

        <p className="mt-4 text-center text-[15px] text-[#4b5563]">
          Dont have an account?{' '}
          <button type="button" onClick={() => setTab('register')} className="font-medium text-[#ff5a5f] hover:underline">
            Register
          </button>
        </p>
      </form>
    </div>
  );
}
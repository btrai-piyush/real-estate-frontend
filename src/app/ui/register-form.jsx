'use client';

import React from 'react';
import SocialLogins from './social-logins';

export default function RegisterForm({ setTab = () => {} }) {
  return (
    <div>
      <SocialLogins mode="register" />

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <input
            type="text"
            placeholder="User Name"
            className="w-full rounded-lg border border-[#dfe4ed] bg-white px-4 py-3 pr-10 text-[15px] text-[#374151] outline-none transition focus:border-[#6b92d4] focus:ring-2 focus:ring-[#6b92d4]/20"
          />
          <svg className="absolute right-3 top-3.5 h-5 w-5 text-[#00788d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-[#dfe4ed] bg-white px-4 py-3 pr-10 text-[15px] text-[#374151] outline-none transition focus:border-[#6b92d4] focus:ring-2 focus:ring-[#6b92d4]/20"
          />
          <svg className="absolute right-3 top-3.5 h-5 w-5 text-[#00788d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="relative">
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-[#dfe4ed] bg-white px-4 py-3 pr-10 text-[15px] text-[#374151] outline-none transition focus:border-[#6b92d4] focus:ring-2 focus:ring-[#6b92d4]/20"
          />
          <svg className="absolute right-3 top-3.5 h-5 w-5 text-[#00788d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="relative">
          <input
            type="password"
            placeholder="Re-enter password"
            className="w-full rounded-lg border border-[#dfe4ed] bg-white px-4 py-3 pr-10 text-[15px] text-[#374151] outline-none transition focus:border-[#6b92d4] focus:ring-2 focus:ring-[#6b92d4]/20"
          />
          <svg className="absolute right-3 top-3.5 h-5 w-5 text-[#00788d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="relative">
          <select className="w-full appearance-none rounded-lg border border-[#dfe4ed] bg-white px-4 py-3 pr-10 text-[15px] text-[#374151] outline-none transition focus:border-[#6b92d4] focus:ring-2 focus:ring-[#6b92d4]/20">
            <option>Single User</option>
            <option>Business Account</option>
          </select>
          <svg className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex items-center pt-2">
          <label className="flex cursor-pointer items-start gap-2 text-[14px] leading-relaxed text-[#4b5563]">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#cbd5e1] text-[#ff5a5f] focus:ring-[#ff5a5f]" />
            <span>I have accept the Terms and Privacy Policy.</span>
          </label>
        </div>

        <button className="mt-5 w-full rounded-lg bg-[#ff5a5f] py-3.5 text-[19px] font-semibold text-white transition hover:bg-[#ff474d]">
          Sign Up
        </button>

        <p className="mt-4 text-center text-[15px] text-[#4b5563]">
          Already have an account?{' '}
          <button type="button" onClick={() => setTab('login')} className="font-medium text-[#ff5a5f] hover:underline">
            Log In
          </button>
        </p>
      </form>
    </div>
  );
}
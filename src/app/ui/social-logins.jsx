import React from 'react';

export default function SocialLogins({ mode = 'login' }) {
  return (
    <div className="mb-6">
      <h3 className="mb-4 text-[30px] font-semibold text-[#0b6f7f]">
        {mode === 'register' ? 'Register' : 'Login'}
      </h3>

      <div className="space-y-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#9ab0df] bg-white py-3 text-[#4a68b0] transition hover:bg-[#f4f8ff]">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
          </svg>
          <span className="font-medium">Continue with Facebook</span>
        </button>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#f3a8a0] bg-white py-3 text-[#eb4f3f] transition hover:bg-[#fff7f6]">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
          <span className="font-medium">Continue with Google</span>
        </button>
      </div>

      <div className="mb-2 mt-8 border-b border-[#e6e8ee]"></div>
    </div>
  );
}
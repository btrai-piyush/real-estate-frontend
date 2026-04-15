'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function getInitials(name = '', email = '') {
    const base = (name || email || '').trim();
    if (!base) return 'U';

    const words = base.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return base.slice(0, 2).toUpperCase();
}

export default function ProfileDropdown({
    userName = '',
    email = '',
    role = 'User',
    onProfileSettings,
    onDashboard,
    onSignOut,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const initials = useMemo(() => getInitials(userName, email), [userName, email]);
    const triggerLabel = userName || email || 'Account';
    const normalizedRole = role?.toString().trim().toLowerCase();
    const roleLabel = normalizedRole === 'admin' ? 'ADMIN' : 'USER';

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 transition hover:bg-[#f4f4f8]"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="Open profile menu"
            >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9b99df] text-sm font-semibold text-white">
                    {initials}
                </span>
                <span className="max-w-[140px] truncate text-[16px] font-medium leading-none text-[#111827]">
                    {triggerLabel}
                </span>
                <svg className="h-4 w-4 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[280px] rounded-xl border border-[#ececf3] bg-white py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                    <div className="flex items-start gap-3 px-5 pb-4">
                        <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9b99df] text-[18px] font-semibold text-white">
                            {initials}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[16px] font-bold leading-tight text-[#111827]">{userName || 'Unknown User'}</p>
                            <p className="truncate text-[14px] text-[#4b5563] mt-0.5">{email || 'No email available'}</p>
                            <span className="mt-1 inline-flex rounded-full bg-[#f3f2ff] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#5f55d1]">
                                {roleLabel}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 px-2 pb-2">
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] font-medium text-[#111827] transition hover:bg-[#f6f7fb]"
                            onClick={() => {
                                setIsOpen(false);
                                if (typeof onProfileSettings === 'function') onProfileSettings();
                            }}
                        >
                            <svg className="h-5 w-5 text-[#111827]" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Profile settings</span>
                        </button>

                        {normalizedRole === 'admin' ? (
                            <button
                                type="button"
                                className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[#f6f7fb]"
                                onClick={() => {
                                    setIsOpen(false);
                                    if (typeof onDashboard === 'function') onDashboard();
                                }}
                            >
                                <svg className="h-5 w-5 text-[#111827] mt-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                    <line x1="8" y1="21" x2="16" y2="21"></line>
                                    <line x1="12" y1="17" x2="12" y2="21"></line>
                                </svg>
                                <div>
                                    <p className="text-[15px] font-medium text-[#111827]">Dashboard</p>
                                    <p className="text-[13px] font-normal text-[#4b5563]">View analytics & administration</p>
                                </div>
                            </button>
                        ) : null}
                    </div>

                    <div className="border-t border-[#f1f2f6] px-2 pt-2">
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] font-medium text-[#9a441b] transition hover:bg-[#fff7f5]"
                            onClick={async () => {
                                setIsOpen(false);
                                if (typeof onSignOut === 'function') await onSignOut();
                            }}
                        >
                            <svg className="h-5 w-5 text-[#9a441b]" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
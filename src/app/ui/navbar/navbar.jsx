'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import NavLinks from "./nav-links";
import { useAuth } from "@/context/AuthContext";
import {
    closeNavbar,
    selectNavbarOpen,
    toggleNavbar,
} from "../../redux/navbar/navbarSlice";
import AuthModal from "../modal/authModal";
import { openModal, setModalTab } from "../../redux/authModal/authModalSlice";
import ProfileDropdown from "@/app/ui/navbar/profile-dropdown";
import { Squares2X2Icon } from "@heroicons/react/16/solid";
import {MapPinHouse} from "lucide-react";


function UserIcon() {
    return (
        <svg
            className="h-5 w-5 text-[#374151]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path
                d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function getDisplayName(user) {
    if (!user) return '';

    const fullName = user.fullName || user.name;
    if (fullName) return fullName;

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const combined = `${firstName} ${lastName}`.trim();
    return combined || user.email || '';
}

function getRoleLabel(user) {
    if (!user) return '';

    if (user.roleLabel) return user.roleLabel;
    if (user.roleName) return user.roleName;

    const role = user.roleID ?? user.roleId ?? user.role;
    if (typeof role === 'string') {
        const normalizedRole = role.trim().toLowerCase();
        if (normalizedRole === 'admin' || normalizedRole === 'administrator' || normalizedRole === '1') {
            return 'Admin';
        }
        if (normalizedRole === 'user' || normalizedRole === '0' || normalizedRole === '2') {
            return 'User';
        }
        return role;
    }

    if (typeof role === 'number') {
        return role === 1 ? 'Admin' : 'User';
    }

    return 'User';
}

export default function Navbar({
    showSidebarToggle = false,
    showSidebarToggleOnMobile = false,
    isSidebarOpen = false,
    onToggleSidebar = () => {},
}) {
    const dispatch = useDispatch();
    const router = useRouter();
    const isOpen = useSelector(selectNavbarOpen);
    const { user, logout } = useAuth();

    const currentUserName = getDisplayName(user);
    const currentUserRole = getRoleLabel(user);
    const isAdminUser = currentUserRole === 'Admin';
    const isLoggedIn = Boolean(currentUserName);
    const showSidebarToggleButton = showSidebarToggle || showSidebarToggleOnMobile;
    const sidebarToggleClass = showSidebarToggle ? "" : "lg:hidden";

    const showAuthModal = (tab = "login") => {
        dispatch(setModalTab(tab));
        dispatch(openModal());
    };

    const handleSignOut = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 z-50 border-b border-[#f0f0f0] bg-white">
            <nav className="relative mx-auto flex h-[65px] w-full max-w-auto items-center justify-between px-4 sm:px-6 lg:px-8 lg:pl-4 shadow-lg">
                <div className={`flex w-[44px] items-center ${sidebarToggleClass}`}>
                    {showSidebarToggleButton ? (
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className={`inline-flex items-center rounded-lg border border-[#e7e7e7] p-2 text-[#374151] ${sidebarToggleClass}`}
                            aria-label="Toggle admin sidebar"
                            aria-expanded={isSidebarOpen}
                        >
                            <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    ) : null}
                </div>

                <Link href="#" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 lg:static lg:translate-x-0">
                    <MapPinHouse className="h-9 w-9 text-[#ff5a5f]" aria-hidden="true" />
                    <span className="text-2xl font-semibold tracking-tight text-[#1f2937] sm:text-2xl lg:text-2xl">
                        RealEstate
                    </span>
                </Link>

                

                <div className="hidden items-center lg:ml-auto lg:flex">
                    <NavLinks />
                    <span className="mx-5 h-7 w-px bg-[#e6e8ef]" aria-hidden="true" />

                    <div className="flex items-center">
                        {isLoggedIn ? (
                            <ProfileDropdown
                                userName={currentUserName}
                                email={user?.email || ''}
                                role={currentUserRole}
                                onProfileSettings={() => {
                                    if (currentUserRole === 'Admin') {
                                        router.push('/admin/my-profile');
                                    } else {
                                        router.push('/home');
                                    }
                                }}
                                onDashboard={() => router.push('/admin/dashboard')}
                                onSignOut={handleSignOut}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => showAuthModal("login")}
                                className="text-[15px] font-medium text-[#374151] transition-colors hover:text-[#ff5a5f]"
                            >
                                <span>Login/Register</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex w-[44px] justify-end lg:hidden">
                    <button
                        type="button"
                        onClick={() => dispatch(toggleNavbar())}
                        className="inline-flex items-center rounded-lg border border-[#e7e7e7] p-2 text-[#374151] lg:hidden"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isOpen}
                    >
                        {isOpen ? (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </nav>

            {
                isOpen ? (
                    <div className="fixed inset-0 top-[65px] z-40 lg:hidden">
                        <button
                            type="button"
                            className="absolute inset-0 bg-black/30"
                            onClick={() => dispatch(closeNavbar())}
                            aria-label="Close mobile navigation"
                        />

                        <div className="absolute right-0 top-0 h-full w-[86vw] max-w-[360px] overflow-y-auto border-l border-[#eceff6] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
                            {isLoggedIn ? (
                                <div className="mb-4 rounded-xl border border-[#edf0f6] bg-[#f8f9fc] p-3">
                                    <div className="flex items-center gap-2 text-[#374151]">
                                        <UserIcon />
                                        <span className="truncate font-semibold">{currentUserName}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-[#6b7280]">Role: {currentUserRole}</p>
                                </div>
                            ) : null}

                            <NavLinks mobile onNavigate={() => dispatch(closeNavbar())} />

                            <div className="mt-5 flex flex-col gap-2 border-t border-[#f0f2f7] pt-4">
                                {isLoggedIn ? (
                                    <>
                                        {isAdminUser ? (
                                            <button
                                                type="button"
                                                className="rounded-lg border border-[#e3e8f2] px-3 py-2.5 text-left text-sm font-medium text-[#1f2937] transition-colors hover:bg-[#f7f8fc]"
                                                onClick={() => {
                                                    dispatch(closeNavbar());
                                                    router.push('/admin/dashboard');
                                                }}
                                            >
                                                Dashboard
                                            </button>
                                        ) : null}

                                        <button
                                            type="button"
                                            className="rounded-lg border border-[#e3e8f2] px-3 py-2.5 text-left text-sm font-medium text-[#1f2937] transition-colors hover:bg-[#f7f8fc]"
                                            onClick={() => {
                                                dispatch(closeNavbar());
                                                if (isAdminUser) {
                                                    router.push('/admin/my-profile');
                                                } else {
                                                    router.push('/home');
                                                }
                                            }}
                                        >
                                            Profile settings
                                        </button>

                                        <button
                                            type="button"
                                            className="rounded-lg bg-[#fff4ef] px-3 py-2.5 text-left text-sm font-semibold text-[#9a441b] transition-colors hover:bg-[#ffe7de]"
                                            onClick={() => {
                                                dispatch(closeNavbar());
                                                handleSignOut();
                                            }}
                                        >
                                            Sign out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="#"
                                        className="flex items-center gap-2 rounded-lg border border-[#e3e8f2] px-3 py-2.5 text-sm font-medium text-[#1f2937] transition-colors hover:bg-[#f7f8fc]"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            dispatch(closeNavbar());
                                            showAuthModal("login");
                                        }}
                                    >
                                        <UserIcon />
                                        <span>Login/Register</span>
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    className="mt-1 rounded-full bg-[#ff5a5f] px-6 py-3 text-sm font-medium text-white"
                                >
                                    + Create Listing
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null
            }

            <AuthModal />
        </header >
    );
}


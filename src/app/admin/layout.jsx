"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/ui/navbar/navbar';
import Sidenav from '@/app/ui/sidenav-dash/sidenav';
import { useAuth } from '@/context/AuthContext';

export default function HomeLayout({ children }) {
    const router = useRouter();
    const { isAuthenticated, isAdmin, isBootstrapping } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.matchMedia('(min-width: 1024px)').matches;
    });

    const closeSidebarIfMobile = () => {
        if (typeof window === 'undefined') {
            return;
        }

        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    useEffect(() => {
        if (isBootstrapping) {
            return;
        }

        if (!isAuthenticated) {
            router.replace('/home/login');
            return;
        }

        if (!isAdmin()) {
            router.replace('/home');
        }
    }, [isAuthenticated, isAdmin, isBootstrapping, router]);

    if (isBootstrapping || !isAuthenticated || !isAdmin()) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar
                showSidebarToggle
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            />
            <Sidenav isOpen={isSidebarOpen} onClose={closeSidebarIfMobile} />
            <main className={`flex-1 bg-[#f6f7fb] transition-[margin] duration-200 ${isSidebarOpen ? 'lg:ml-[250px]' : 'lg:ml-0'}`}>
                {children}
            </main>
        </div>
    );
}
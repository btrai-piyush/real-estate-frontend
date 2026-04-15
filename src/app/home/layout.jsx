'use client';

import Navbar from '@/app/ui/navbar/navbar';
import Footer from '@/app/ui/footer';

export default function HomeLayout({children} ) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 bg-white">
                {children}
                
            </main>
            <Footer />
        </div>
    );
}
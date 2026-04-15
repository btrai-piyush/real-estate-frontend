'use client';

import {
    MainNavLinks,
    ManageListingsNavLinks,
    AccountingNavLinks,
    ManageAccountNavLinks,
} from "@/app/ui/sidenav-dash/nav-links";

export default function Sidenav({ isOpen = false, onClose = () => {} }) {
    const sections = [
        {
            id: 'main',
            title: 'Main',
            Content: MainNavLinks,
        },
        {
            id: 'listings',
            title: 'Manage Listings',
            Content: ManageListingsNavLinks,
        },
        {
            id: 'accounting',
            title: 'Accounting',
            Content: AccountingNavLinks,
        },
        {
            id: 'account',
            title: 'Manage Account',
            Content: ManageAccountNavLinks,
        },
    ];

    return (
        <>
            <aside className={`fixed left-0 top-[65px] z-40 h-[calc(100vh-65px)] w-[250px] overflow-y-auto overflow-x-hidden border-r border-[#25385c] bg-[#1c2d4c] text-white transition-transform duration-200 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <nav className="py-1">
                    {sections.map(({ id, title, Content }) => (
                        <section key={id} className="border-b border-[#2a3f67] last:border-b-0">
                            <div className="px-4 py-3">
                                <h3 className="text-[15px] font-medium tracking-wide text-[#7f92b7]">{title}</h3>
                            </div>
                            <div className="pl-1 pb-2">
                                <Content onNavigate={onClose} />
                            </div>
                        </section>
                    ))}
                </nav>
            </aside>

            {isOpen ? (
                <button
                    type="button"
                    className="fixed inset-0 z-30 bg-black/35 hidden"
                    onClick={onClose}
                    aria-label="Close admin sidebar"
                />
            ) : null}
        </>
    );
}
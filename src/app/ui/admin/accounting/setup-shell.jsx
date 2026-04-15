"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { href: "/admin/master-group", label: "Master Group", countKey: "masterGroups" },
  { href: "/admin/gl-group", label: "GL Group", countKey: "glGroups" },
  { href: "/admin/gl-head", label: "GL Head", countKey: "glHeads" },
];

export default function AccountingSetupShell({ title, description, counts, children }) {
  const pathname = usePathname();
  const summaryCards = [
    { label: "Master Groups", value: counts?.masterGroups ?? 0 },
    { label: "GL Groups", value: counts?.glGroups ?? 0 },
    { label: "GL Heads", value: counts?.glHeads ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-blue-50 p-4 shadow-sm sm:mb-6 sm:p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm sm:h-10 sm:w-10">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">{title}</h1>
          </div>
          {/* <p className="mb-4 max-w-3xl text-sm text-slate-600 md:mb-5 md:text-[15px]">{description}</p> */}

          <div className="mb-4 grid grid-cols-1 gap-2 sm:mb-5 sm:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:px-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-3 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-100/90 p-2 sm:grid-cols-3">
            {STEPS.map((step, index) => {
              const isActive = pathname === step.href;
              const count = counts?.[step.countKey] ?? 0;

              return (
                <Link
                  key={step.href}
                  href={step.href}
                  className={`inline-flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-200 bg-blue-600 text-white shadow-sm"
                      : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold ${
                      isActive
                        ? "border-white/50 bg-white text-blue-700"
                        : "border-slate-300 bg-slate-100 text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1">{step.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive ? "bg-white text-blue-700" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-7">
          {children}
        </section>
      </div>
    </div>
  );
}

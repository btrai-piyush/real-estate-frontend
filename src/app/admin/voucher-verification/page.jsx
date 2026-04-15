'use client';

import { useState, useMemo } from 'react';
// import { mockVouchers, Voucher } from './data';

function formatNumber(num) {
  if (num === null) return '';
  return num.toFixed(4);
}

// ─── Ledger Sub-Table ───────────────────────────────────────
function LedgerTable({ entries }) {
  const totalDebit = entries.reduce((s, e) => s + (e.debit ?? 0), 0);
  const totalCredit = entries.reduce((s, e) => s + (e.credit ?? 0), 0);

  return (
    <div className="mx-6 my-3 border border-teal-700 rounded-md overflow-hidden">
      {/* header */}
      <div className="grid grid-cols-12 bg-teal-700 text-white text-xs font-bold uppercase tracking-wide">
        <div className="col-span-3 px-4 py-2">Ledger Name</div>
        <div className="col-span-2 px-4 py-2">Debit</div>
        <div className="col-span-2 px-4 py-2">Credit</div>
        <div className="col-span-5 px-4 py-2">Reference</div>
      </div>
      {/* rows */}
      {entries.map((entry, idx) => (
        <div
          key={idx}
          className={`grid grid-cols-12 text-sm border-b border-gray-200 ${
            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          <div className="col-span-3 px-4 py-2 text-gray-700">{entry.ledgerName}</div>
          <div className="col-span-2 px-4 py-2 text-gray-700">
            {formatNumber(entry.debit)}
          </div>
          <div className="col-span-2 px-4 py-2 text-gray-700">
            {formatNumber(entry.credit)}
          </div>
          <div className="col-span-5 px-4 py-2 text-gray-600 text-xs leading-5">
            {entry.reference}
          </div>
        </div>
      ))}
      {/* total */}
      <div className="grid grid-cols-12 text-sm font-semibold bg-gray-100 border-t border-gray-300">
        <div className="col-span-3 px-4 py-2 text-gray-800">Total</div>
        <div className="col-span-2 px-4 py-2 text-gray-800">
          {formatNumber(totalDebit)}
        </div>
        <div className="col-span-2 px-4 py-2 text-gray-800">
          {formatNumber(totalCredit)}
        </div>
        <div className="col-span-5 px-4 py-2"></div>
      </div>
    </div>
  );
}

// ─── Voucher Row ────────────────────────────────────────────
function VoucherRow({
  voucher,
  onApprove,
  onReject,
}) {
  return (
    <div className="border-b border-gray-200 bg-blue-50/40">
      {/* main row */}
      <div className="grid grid-cols-12 items-center text-sm py-3 px-2">
        {/* Approve / Reject */}
        <div className="col-span-2 flex gap-2 px-2">
          <button
            onClick={onApprove}
            disabled={voucher.status !== 'Pending'}
            className="flex items-center gap-1 border border-green-400 text-green-600 bg-green-50 hover:bg-green-100 rounded px-2.5 py-1 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={voucher.status !== 'Pending'}
            className="flex items-center gap-1 border border-red-400 text-red-500 bg-red-50 hover:bg-red-100 rounded px-2.5 py-1 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Reject
          </button>
        </div>
        <div className="col-span-1 text-center font-medium text-gray-800">
          {voucher.journalId}
        </div>
        <div className="col-span-2 text-center text-gray-700">{voucher.enteredBy}</div>
        <div className="col-span-2 text-center text-gray-700">{voucher.entryDate}</div>
        <div className="col-span-2 text-center text-gray-700">{voucher.valueDate}</div>
        <div className="col-span-1 text-center">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
              voucher.status === 'Pending'
                ? 'bg-yellow-100 text-yellow-700'
                : voucher.status === 'Approved'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {voucher.status}
          </span>
        </div>
        <div className="col-span-2 text-center text-gray-600 text-xs">
          {voucher.verifiedBy || '—'}
        </div>
      </div>
      {/* nested ledger table */}
      <LedgerTable entries={voucher.ledgerEntries} />
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────
export default function App() {
  const [vouchers, setVouchers] = useState(["A/Count Payable", "Cash"].map((name, idx) => ({
    journalId: 1000 + idx,
    enteredBy: `User ${idx + 1}`,
    entryDate: '2023-12-27',
    valueDate: '2023-12-27',
    status: 'Pending',
    verifiedBy: null,
    ledgerEntries: [
      { id: 1, headName: name, type: 'Debit', amount: 1000 },
      { id: 2, headName: 'Office Supplies', type: 'Credit', amount: 1000 }
    ]
  })));
  const [searchMode, setSearchMode] = useState<'id' | 'date'>('id');
  const [searchText, setSearchText] = useState('');

  // date range state
  const [fromDay, setFromDay] = useState('27');
  const [fromMonth, setFromMonth] = useState('12');
  const [fromYear, setFromYear] = useState('2082');
  const [toDay, setToDay] = useState('27');
  const [toMonth, setToMonth] = useState('12');
  const [toYear, setToYear] = useState('2082');

  const [activeSearch, setActiveSearch] = useState('');
  const [activeDateSearch, setActiveDateSearch] = useState(false);

  const filtered = useMemo(() => {
    if (activeSearch) {
      return vouchers.filter((v) =>
        v.journalId.toString().includes(activeSearch)
      );
    }
    return vouchers;
  }, [vouchers, activeSearch, activeDateSearch]);

  const handleApprove = (id) => {
    setVouchers((prev) =>
      prev.map((v) =>
        v.journalId === id
          ? { ...v, status: 'Approved' , verifiedBy: 'Admin' }
          : v
      )
    );
  };

  const handleReject = (id) => {
    setVouchers((prev) =>
      prev.map((v) =>
        v.journalId === id
          ? { ...v, status: 'Rejected', verifiedBy: 'Admin' }
          : v
      )
    );
  };

  const handleSearch = () => {
    setActiveSearch(searchText);
    setActiveDateSearch(false);
  };

  const handleSearchByDate = () => {
    setActiveSearch('');
    setActiveDateSearch(true);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setActiveSearch('');
    setActiveDateSearch(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Voucher Verification</h1>
      </div>

      {/* Search Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        {/* Top row: mode buttons + search input + search button */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => setSearchMode('id')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition cursor-pointer ${
              searchMode === 'id'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Voucher ID
          </button>
          <button
            onClick={() => setSearchMode('date')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition cursor-pointer ${
              searchMode === 'date'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Entry Date
          </button>

          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by Voucher ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
          </div>

          <button
            onClick={handleSearch}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>

          {activeSearch && (
            <button
              onClick={handleClearSearch}
              className="text-xs text-gray-500 hover:text-red-500 underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date range row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-dashed border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            From
          </span>
          <div className="flex gap-1">
            <input
              type="text"
              maxLength={2}
              value={fromDay}
              onChange={(e) => setFromDay(e.target.value)}
              className="w-10 border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <input
              type="text"
              maxLength={2}
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              className="w-10 border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <input
              type="text"
              maxLength={4}
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
              className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>

          <span className="text-gray-400 text-lg">→</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            To
          </span>
          <div className="flex gap-1">
            <input
              type="text"
              maxLength={2}
              value={toDay}
              onChange={(e) => setToDay(e.target.value)}
              className="w-10 border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <input
              type="text"
              maxLength={2}
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              className="w-10 border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <input
              type="text"
              maxLength={4}
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
              className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>

          <div className="ml-auto">
            <button
              onClick={handleSearchByDate}
              className="flex items-center gap-1.5 border border-indigo-400 text-indigo-600 bg-white hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Search by Date
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table header — gradient blue bar */}
        <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 py-3 px-2">
          <div className="col-span-2 px-2"></div>
          <div className="col-span-1 text-center">Journal ID</div>
          <div className="col-span-2 text-center">Entered By</div>
          <div className="col-span-2 text-center">Entry Date</div>
          <div className="col-span-2 text-center">Value Date</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Verified By</div>
        </div>

        {/* Rows */}
        {filtered.length > 0 ? (
          filtered.map((v) => (
            <VoucherRow
              key={v.journalId}
              voucher={v}
              onApprove={() => handleApprove(v.journalId)}
              onReject={() => handleReject(v.journalId)}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            No vouchers found.
          </div>
        )}
      </div>

      {/* Footer summary */}
      <div className="mt-4 text-xs text-gray-400 text-right">
        Showing {filtered.length} of {vouchers.length} voucher(s)
      </div>
    </div>
  );
}

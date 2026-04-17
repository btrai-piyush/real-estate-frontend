'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { accountingApi } from '@/api/api';
import { showAdminErrorToast, showAdminSuccessToast } from '@/app/lib/admin-toast';
import { Search, CalendarDays, IdCardLanyard } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

function formatNumber(num) {
  if (num === null || num === undefined) return '';
  const value = Number(num);
  if (!Number.isFinite(value)) return '';
  return value.toFixed(4);
}

function formatDateTime(value) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }
  return parsed.toLocaleDateString();
}

function toAmount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function mapStatus(value) {
  const status = Number(value);
  if (status === 1) return 'Approved';
  if (status === 2) return 'Rejected';
  return 'Pending';
}

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function parseDateSearchText(value) {
  const input = String(value || '').trim();
  if (!input) {
    return null;
  }

  const yearFirstMatch = input.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (yearFirstMatch) {
    const [, year, month, day] = yearFirstMatch;
    const fromDate = buildIsoFromParts(day, month, year, false);
    const toDate = buildIsoFromParts(day, month, year, true);
    return fromDate && toDate ? { fromDate, toDate } : null;
  }

  const dayFirstMatch = input.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dayFirstMatch) {
    const [, day, month, year] = dayFirstMatch;
    const fromDate = buildIsoFromParts(day, month, year, false);
    const toDate = buildIsoFromParts(day, month, year, true);
    return fromDate && toDate ? { fromDate, toDate } : null;
  }

  return null;
}

function buildIsoFromParts(day, month, year, endOfDay = false) {
  const parsedDay = Number(day);
  const parsedMonth = Number(month);
  const parsedYear = Number(year);

  if (
    !Number.isInteger(parsedDay) ||
    !Number.isInteger(parsedMonth) ||
    !Number.isInteger(parsedYear) ||
    parsedMonth < 1 ||
    parsedMonth > 12 ||
    parsedDay < 1 ||
    parsedDay > 31
  ) {
    return null;
  }

  const utcDate = new Date(
    Date.UTC(
      parsedYear,
      parsedMonth - 1,
      parsedDay,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    ),
  );

  if (
    utcDate.getUTCFullYear() !== parsedYear ||
    utcDate.getUTCMonth() !== parsedMonth - 1 ||
    utcDate.getUTCDate() !== parsedDay
  ) {
    return null;
  }

  return utcDate.toISOString();
}

function normalizeVoucherRows(rows = []) {
  const grouped = new Map();

  rows.forEach((row, index) => {
    const journalId = Number(row?.journalID);
    if (!Number.isFinite(journalId) || journalId <= 0) {
      return;
    }

    if (!grouped.has(journalId)) {
      grouped.set(journalId, {
        journalId,
        enteredBy: row?.enteredBy || '—',
        entryDate: formatDateTime(row?.entryDate),
        valueDate: formatDateTime(row?.valueDate),
        status: mapStatus(row?.status),
        verifiedBy: row?.verifiedBy || null,
        debitTotal: toAmount(row?.debitTotal),
        creditTotal: toAmount(row?.creditTotal),
        ledgerEntries: [],
      });
    }

    const voucher = grouped.get(journalId);
    voucher.ledgerEntries.push({
      id: `${journalId}-${index}`,
      ledgerName: row?.ledgerName || '—',
      debit: toAmount(row?.debit),
      credit: toAmount(row?.credit),
      reference: row?.reference || '',
    });
  });

  return Array.from(grouped.values())
    .map((voucher) => {
      if (voucher.debitTotal || voucher.creditTotal) {
        return voucher;
      }

      const debitTotal = voucher.ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
      const creditTotal = voucher.ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);

      return {
        ...voucher,
        debitTotal,
        creditTotal,
      };
    })
    .sort((a, b) => b.journalId - a.journalId);
}

function LedgerTable({ entries, debitTotal, creditTotal }) {
  return (
    <div className="mx-6 my-3 overflow-x-auto">
      <div className="min-w-[680px] overflow-hidden rounded-md border border-teal-700">
        <div className="grid grid-cols-12 bg-teal-700 text-xs font-bold uppercase tracking-wide text-white">
          <div className="col-span-3 px-4 py-2">Ledger Name</div>
          <div className="col-span-2 px-4 py-2">Debit</div>
          <div className="col-span-2 px-4 py-2">Credit</div>
          <div className="col-span-5 px-4 py-2">Reference</div>
        </div>

        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className={`grid grid-cols-12 border-b border-gray-200 text-sm ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
          >
            <div className="col-span-3 px-4 py-2 text-gray-700">{entry.ledgerName}</div>
            <div className="col-span-2 px-4 py-2 text-gray-700">{formatNumber(entry.debit)}</div>
            <div className="col-span-2 px-4 py-2 text-gray-700">{formatNumber(entry.credit)}</div>
            <div className="col-span-5 px-4 py-2 text-xs leading-5 text-gray-600">{entry.reference || '—'}</div>
          </div>
        ))}

        <div className="grid grid-cols-12 border-t border-gray-300 bg-gray-100 text-sm font-semibold">
          <div className="col-span-3 px-4 py-2 text-gray-800">Total</div>
          <div className="col-span-2 px-4 py-2 text-gray-800">{formatNumber(debitTotal)}</div>
          <div className="col-span-2 px-4 py-2 text-gray-800">{formatNumber(creditTotal)}</div>
          <div className="col-span-5 px-4 py-2" />
        </div>
      </div>
    </div>
  );
}

function VoucherRow({ voucher, onApprove, onReject }) {
  const isPending = voucher.status === 'Pending';

  return (
    <div className="border-b border-gray-200 bg-blue-50/40">
      <div className="grid grid-cols-12 items-center px-2 py-3 text-sm">
        <div className="col-span-2 flex gap-2 px-2">
          <button
            onClick={onApprove}
            disabled={!isPending}
            className="cursor-pointer rounded border border-green-400 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={!isPending}
            className="cursor-pointer rounded border border-red-400 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject
          </button>
        </div>

        <div className="col-span-1 text-center font-medium text-gray-800">{voucher.journalId}</div>
        <div className="col-span-2 text-center text-gray-700">{voucher.enteredBy}</div>
        <div className="col-span-2 text-center text-gray-700">{voucher.entryDate}</div>
        <div className="col-span-2 text-center text-gray-700">{voucher.valueDate}</div>
        <div className="col-span-1 text-center">
          <span
            className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${voucher.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-700'
              : voucher.status === 'Approved'
                ? 'bg-green-400 text-yellow-100'
                : 'bg-red-700 text-yellow-100'
              }`}
          >
            {voucher.status}
          </span>
        </div>
        <div className="col-span-2 text-center text-xs text-gray-600">{voucher.verifiedBy || '—'}</div>
      </div>

      <LedgerTable
        entries={voucher.ledgerEntries}
        debitTotal={voucher.debitTotal}
        creditTotal={voucher.creditTotal}
      />
    </div>
  );
}

export default function VoucherVerificationPage() {
  const { user } = useAuth();
  const now = new Date();
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = String(now.getFullYear());

  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryError, setQueryError] = useState('');

  const [searchMode, setSearchMode] = useState('id');
  const [searchText, setSearchText] = useState('');

  const [fromDay, setFromDay] = useState(currentDay);
  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [fromYear, setFromYear] = useState(currentYear);
  const [toDay, setToDay] = useState(currentDay);
  const [toMonth, setToMonth] = useState(currentMonth);
  const [toYear, setToYear] = useState(currentYear);

  const verifiedById = useMemo(() => {
    const currentUserId = user?.userId ?? user?.userID ?? user?.id ?? user?.ID ?? user?.nameIdentifier;
    return currentUserId ? String(currentUserId) : '';
  }, [user]);

  const verifiedByLabel = useMemo(() => {
    const username = user?.userName ?? user?.username;
    if (username) return String(username);

    const fullName = user?.fullName ?? user?.name;
    if (fullName) return String(fullName);

    const email = user?.email;
    return email ? String(email) : '';
  }, [user]);

  const verifyJournal = async (journalID, status) => {
    const statusValue = status === 'Approved' ? 1 : status === 'Rejected' ? 2 : 0;

    return await accountingApi.verifyJournal({ journalID, status: statusValue, verifiedBy: verifiedById });
  };

  const runVoucherQuery = useCallback(async ({ journalID, fromDate, toDate }) => {
    setIsLoading(true);
    setQueryError('');

    try {
      const rows = await accountingApi.voucherQuery({ journalID, fromDate, toDate });
      setVouchers(normalizeVoucherRows(rows));
    } catch (error) {
      const message = error?.message || 'Failed to load vouchers.';
      setQueryError(message);
      setVouchers([]);
      showAdminErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    runVoucherQuery({});
  }, [runVoucherQuery]);

  const handleStatusChange = async (id, nextStatus) => {
    try {
      if (!verifiedById) {
        showAdminErrorToast('Unable to verify voucher without a logged-in user id.');
        return;
      }

      await verifyJournal(id, nextStatus);

      setVouchers((prev) =>
        prev.map((voucher) =>
          voucher.journalId === id
            ? { ...voucher, status: nextStatus, verifiedBy: verifiedByLabel || voucher.verifiedBy }
            : voucher,
        ),
      );

      showAdminSuccessToast(`Voucher ${nextStatus.toLowerCase()} successfully.`);
    } catch (error) {
      showAdminErrorToast(error?.message || `Failed to ${nextStatus.toLowerCase()} voucher.`);
    }
  };

  const handleApprove = (id) => handleStatusChange(id, 'Approved');

  const handleReject = (id) => handleStatusChange(id, 'Rejected');

  const getDateRange = () => {
    const fromDate = buildIsoFromParts(fromDay, fromMonth, fromYear, false);
    const toDate = buildIsoFromParts(toDay, toMonth, toYear, true);

    if (!fromDate || !toDate) {
      showAdminErrorToast('Please enter a valid From/To date.');
      return null;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showAdminErrorToast('From date cannot be greater than To date.');
      return null;
    }

    return { fromDate, toDate };
  };

  const handleSearch = async () => {
    if (searchMode === 'id') {
      const voucherID = parsePositiveInt(searchText);
      if (!voucherID) {
        showAdminErrorToast('Enter a valid voucher ID.');
        return;
      }

      await runVoucherQuery({
        journalID: voucherID,
      });
      return;
    }

    const typedDateRange = parseDateSearchText(searchText);
    if (searchText.trim()) {
      if (!typedDateRange) {
        showAdminErrorToast('Enter a valid date (YYYY-MM-DD or DD/MM/YYYY).');
        return;
      }

      await runVoucherQuery({
        fromDate: typedDateRange.fromDate,
        toDate: typedDateRange.toDate,
      });
      return;
    }

    const range = getDateRange();
    if (!range) {
      return;
    }

    await runVoucherQuery({
      fromDate: range.fromDate,
      toDate: range.toDate,
    });
  };

  const handleSearchByDate = async () => {
    const range = getDateRange();
    if (!range) {
      return;
    }

    await runVoucherQuery({
      fromDate: range.fromDate,
      toDate: range.toDate,
    });
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="min-h-screen 2xl:max-w-8/10 mx-auto bg-gray-200 p-4 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Voucher Verification</h1>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSearchMode('id')}
              className={`cursor-pointer rounded-lg border px-2 py-2 text-sm font-medium transition ${searchMode === 'id'
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
            >
              <IdCardLanyard className="inline h-4 w-4 mr-1" />
              Voucher ID
            </button>

            <button
              onClick={() => setSearchMode('date')}
              className={`cursor-pointer rounded-lg border px-2 py-2 text-sm font-medium transition ${searchMode === 'date'
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
            >
              <CalendarDays className="inline h-4 w-4 mr-1" />
              Entry Date
            </button>

            <div className="min-w-[200px] flex-1">
              <input
                type="text"
                placeholder={
                  searchMode === 'id'
                    ? 'Search by Voucher ID...'
                    : 'Search by Entry Date (YYYY-MM-DD or DD/MM/YYYY)'
                }
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                className="w-full text-black rounded-lg border border-gray-300 px-4 py-2 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="inline h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </button>

          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-gray-200 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">From</span>
            <div className="flex gap-1">
              <input
                type="text"
                maxLength={2}
                value={fromDay}
                onChange={(event) => setFromDay(event.target.value)}
                className="w-10 text-slate-800 rounded border border-gray-300 px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <input
                type="text"
                maxLength={2}
                value={fromMonth}
                onChange={(event) => setFromMonth(event.target.value)}
                className="w-10 text-slate-800 rounded border border-gray-300 px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <input
                type="text"
                maxLength={4}
                value={fromYear}
                onChange={(event) => setFromYear(event.target.value)}
                className="w-16 text-slate-800 rounded border border-gray-300 px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">To</span>
            <div className="flex gap-1">
              <input
                type="text"
                maxLength={2}
                value={toDay}
                onChange={(event) => setToDay(event.target.value)}
                className="w-10 text-slate-800 rounded border border-gray-300 px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <input
                type="text"
                maxLength={2}
                value={toMonth}
                onChange={(event) => setToMonth(event.target.value)}
                className="w-10 text-slate-800 rounded border border-gray-300 px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <input
                type="text"
                maxLength={4}
                value={toYear}
                onChange={(event) => setToYear(event.target.value)}
                className="w-16 text-slate-800 rounded border border-gray-300 px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="ml-auto">
              <button
                onClick={handleSearchByDate}
                disabled={isLoading}
                className="cursor-pointer rounded-lg border border-indigo-400 bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Search by Date
              </button>
            </div>
          </div>
        </div>

        {queryError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {queryError}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-12 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-2 py-3 text-xs font-bold uppercase tracking-wider text-white">
                <div className="col-span-2 px-2" />
                <div className="col-span-1 text-center">Journal ID</div>
                <div className="col-span-2 text-center">Entered By</div>
                <div className="col-span-2 text-center">Entry Date</div>
                <div className="col-span-2 text-center">Value Date</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-2 text-center">Verified By</div>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-sm text-gray-400">Loading vouchers...</div>
              ) : vouchers.length > 0 ? (
                vouchers.map((voucher) => (
                  <VoucherRow
                    key={voucher.journalId}
                    voucher={voucher}
                    onApprove={() => handleApprove(voucher.journalId)}
                    onReject={() => handleReject(voucher.journalId)}
                  />
                ))
              ) : (
                <div className="py-12 text-center text-sm text-gray-400">No vouchers found.</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-right text-xs text-gray-400">
          Showing {vouchers.length} voucher(s)
        </div>
      </div>
    </div>
  );
}

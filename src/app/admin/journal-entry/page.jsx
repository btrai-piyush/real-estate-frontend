'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { accountingApi, branchApi } from "@/api/api";
import { showAdminErrorToast, showAdminSuccessToast } from "@/app/lib/admin-toast";
import { nunito } from "@/app/ui/fonts";
import { useAuth } from "@/context/AuthContext";

function normalizeGLHead(raw = {}) {
  const id = raw.id ?? raw.ledgerID ?? raw.glID ?? raw.glHeadID;
  const name = raw.glName ?? raw.name ?? raw.ledgerName;

  if (id === undefined || id === null) {
    return null;
  }

  return {
    id: Number(id),
    name: String(name || `GL ${id}`),
  };
}

function normalizeBranch(raw = {}) {
  const id = raw.id ?? raw.branchId ?? raw.ID;
  const name = raw.branchName ?? raw.name ?? raw.branchCode;

  if (id === undefined || id === null) {
    return null;
  }

  return {
    id: Number(id),
    name: String(name || `Branch ${id}`),
  };
}

export default function GLVoucherEntry() {
  const { user } = useAuth();
  const today = new Date();
  const [day, setDay] = useState(String(today.getDate()).padStart(2, "0"));
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [branchID, setBranchID] = useState("");
  const [txnType, setTxnType] = useState("GL Head");

  const [glHead, setGlHead] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [balanceType, setBalanceType] = useState("Debit");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [entries, setEntries] = useState([]);
  const [saved, setSaved] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
  const [glHeadOptions, setGlHeadOptions] = useState([]);
  const [apiLoadError, setApiLoadError] = useState("");
  const [errors, setErrors] = useState({});

  const userID = useMemo(() => {
    const currentUserId = user?.userId ?? user?.userID ?? user?.id ?? user?.ID ?? user?.nameIdentifier;
    return currentUserId ? String(currentUserId) : "";
  }, [user]);

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setApiLoadError("");

    try {
      const [headsPayload, branchesPayload] = await Promise.all([
        accountingApi.getGLHeads(),
        branchApi.getBranches(),
      ]);

      const branchRows = Array.isArray(branchesPayload)
        ? branchesPayload
        : Array.isArray(branchesPayload?.data)
          ? branchesPayload.data
          : Array.isArray(branchesPayload?.items)
            ? branchesPayload.items
            : [];

      const normalizedHeads = (Array.isArray(headsPayload) ? headsPayload : [])
        .map(normalizeGLHead)
        .filter(Boolean);
      const normalizedBranches = branchRows
        .map(normalizeBranch)
        .filter(Boolean);

      setGlHeadOptions(normalizedHeads);
      setBranchOptions(normalizedBranches);

      setBranchID((previous) => {
        if (previous && normalizedBranches.some((branch) => String(branch.id) === String(previous))) {
          return previous;
        }

        return normalizedBranches.length > 0 ? String(normalizedBranches[0].id) : "";
      });
    } catch (error) {
      setApiLoadError(error?.message || "Failed to load accounting options.");
      setGlHeadOptions([]);
      setBranchOptions([]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const totalDebit = entries.reduce((sum, entry) => sum + (entry.type === "Debit" ? entry.amount : 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (entry.type === "Credit" ? entry.amount : 0), 0);
  const balanceDifference = Math.abs(totalDebit - totalCredit);
  const balanced = entries.length > 0 && balanceDifference < 0.005;

  const inputBase = "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500";
  const labelBase = "mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500";
  const sectionBase = "w-full max-w-[1100px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]";
  const sectionHeaderBase = "border-b border-amber-100 bg-[#23314d] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white";
  const pillButtonBase = "cursor-pointer rounded-lg border px-5 py-2 text-[13px] font-medium transition duration-200";

  function validate() {
    const nextErrors = {};
    if (!branchID) nextErrors.branchID = "Select branch";
    if (!glHead) nextErrors.glHead = "Select a GL Head";
    if (txnType === "Customer" && (!customerID || Number.isNaN(Number(customerID)) || Number(customerID) <= 0)) {
      nextErrors.customerID = "Customer ID is required";
    }
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) nextErrors.amount = "Enter valid amount";
    return nextErrors;
  }

  function buildValueDateISO() {
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

    const utcDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay));
    if (
      utcDate.getUTCFullYear() !== parsedYear ||
      utcDate.getUTCMonth() !== parsedMonth - 1 ||
      utcDate.getUTCDate() !== parsedDay
    ) {
      return null;
    }

    return utcDate.toISOString();
  }

  function addEntry() {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const head = glHeadOptions.find((entry) => entry.id === Number(glHead));

    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        ledgerID: Number(glHead),
        headName: head?.name || "",
        type: balanceType,
        amount: Number(amount),
        reference: reference.trim(),
        customerID: txnType === "Customer" ? Number(customerID) : null,
      },
    ]);

    setGlHead("");
    setAmount("");
    setReference("");
    setCustomerID("");
    setBalanceType("Debit");
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  async function saveVoucher() {
    if (!balanced || isSubmitting) return;

    if (!userID) {
      showAdminErrorToast("Unable to determine current user ID.");
      return;
    }

    if (!branchID) {
      setErrors((prev) => ({ ...prev, branchID: "Select branch" }));
      showAdminErrorToast("Please select a branch.");
      return;
    }

    const valueDate = buildValueDateISO();
    if (!valueDate) {
      showAdminErrorToast("Please enter a valid value date.");
      return;
    }

    const payload = {
      userID,
      entryDate: new Date().toISOString(),
      valueDate,
      branchID: Number(branchID),
      journalDetails: entries.map((entry) => ({
        ledgerID: Number(entry.ledgerID),
        debit: entry.type === "Debit" ? Number(entry.amount) : 0,
        credit: entry.type === "Credit" ? Number(entry.amount) : 0,
        reference: entry.reference,
        customerID: txnType === "Customer" ? Number(entry.customerID) : null,
      })),
    };

    if (txnType === "Customer") {
      const hasMissingCustomerID = payload.journalDetails.some(
        (detail) => !detail.customerID || Number(detail.customerID) <= 0
      );

      if (hasMissingCustomerID) {
        showAdminErrorToast("Customer ID is required for Customer transaction type.");
        return;
      }
    }

    setIsSubmitting(true);
    setSaved(false);

    try {
      const response = await accountingApi.createJournalEntry(payload);
      const message =
        (typeof response === "object" && response?.message) ||
        (typeof response === "string" && response) ||
        "Journal inserted successfully";

      showAdminSuccessToast(message);
      setSaved(true);
      setEntries([]);
      setErrors({});
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      showAdminErrorToast(error?.message || "Failed to save journal entry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`${nunito.className} flex min-h-screen flex-col items-center bg-slate-100 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 text-slate-800`}>
      <div className="mb-6 sm:mb-8 flex w-full max-w-[1100px] flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <div className="text-lg sm:text-xl md:text-[22px] font-semibold uppercase tracking-[0.08em] text-slate-900">
            General Ledger Entry
          </div>
        </div>
        <div className="text-right sm:ml-auto">
          <div
            className={`text-xs font-semibold ${
              balanced ? "text-emerald-600" : entries.length > 0 ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {entries.length > 0 ? (balanced ? "✓ Balanced" : "⚠ Unbalanced") : "No Entries"}
          </div>
        </div>
      </div>

      <div className={`${sectionBase} mb-5`}>
        <div className={sectionHeaderBase}>Transaction Details</div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6 sm:p-6">
          <div className="w-full sm:w-auto sm:shrink-0">
            <label className={labelBase}>Value Date</label>
            <div className="flex gap-2 items-end">
              {[
                { val: day, set: setDay, ph: "DD", widthClass: "w-16" },
                { val: month, set: setMonth, ph: "MM", widthClass: "w-16" },
                { val: year, set: setYear, ph: "YYYY", widthClass: "w-[88px]" },
              ].map((field, index) => (
                <input
                  key={index}
                  value={field.val}
                  onChange={(event) => field.set(event.target.value)}
                  placeholder={field.ph}
                  className={`${inputBase} ${field.widthClass} text-center text-xs sm:text-sm`}
                />
              ))}
            </div>
          </div>

          <div className="w-full sm:min-w-[200px] sm:flex-1">
            <label className={labelBase}>Office / Branch</label>
            <select
              value={branchID}
              onChange={(event) => {
                setBranchID(event.target.value);
                setErrors((previous) => ({ ...previous, branchID: undefined }));
              }}
              className={`${inputBase} cursor-pointer appearance-none text-xs sm:text-sm ${errors.branchID ? "border-rose-500" : "border-slate-200"}`}
            >
              <option value="">Select branch...</option>
              {branchOptions.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
            {errors.branchID && <span className="mt-1 block text-[11px] text-rose-600">{errors.branchID}</span>}
          </div>

          <div className="w-full sm:w-auto sm:shrink-0">
            <label className={labelBase}>Transaction Type</label>
            <div className="flex gap-2">
              {["GL Head", "Customer"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setTxnType(type);
                    setErrors((previous) => ({ ...previous, customerID: undefined }));

                    if (type !== "Customer") {
                      setCustomerID("");
                    }
                  }}
                  className={`${pillButtonBase} flex-1 sm:flex-initial text-xs sm:text-[13px] ${
                    txnType === type
                      ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                      : "border-slate-200 bg-transparent text-slate-500 hover:border-amber-300 hover:text-slate-800"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`${sectionBase} mb-5`}>
        <div className={sectionHeaderBase}>Add GL Entry</div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start">
            <div className="w-full max-w-[600px] sm:min-w-[220px] sm:flex-2">
              <label className={labelBase}>GL Head</label>
              <select
                value={glHead}
                onChange={(event) => {
                  setGlHead(event.target.value);
                  setErrors((previous) => ({ ...previous, glHead: undefined }));
                }}
                className={`${inputBase} cursor-pointer appearance-none text-xs sm:text-sm ${
                  errors.glHead ? "border-rose-500" : "border-slate-200"
                } ${glHead ? "text-slate-800" : "text-slate-500"}`}
              >
                <option value="">{isLoadingOptions ? "Loading GL Heads..." : "Select GL Head..."}</option>
                {glHeadOptions.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
              {errors.glHead && <span className="mt-1 block text-[11px] text-rose-600">{errors.glHead}</span>}
            </div>

            <div className="w-full sm:w-auto sm:shrink-0">
              <label className={labelBase}>Balance Type</label>
              <div className="flex gap-2">
                {["Debit", "Credit"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBalanceType(type)}
                    className={`${pillButtonBase} flex-1 sm:flex-initial text-xs sm:text-[13px] ${
                      balanceType === type
                        ? type === "Debit"
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {txnType === "Customer" && (
              <div className="w-full min-w-[220px] sm:max-w-[400px] sm:flex-[0_1_160px] lg:flex-[0_1_220px]">
                <label className={labelBase}>Customer ID *</label>
                <input
                  type="number"
                  value={customerID}
                  onChange={(event) => {
                    setCustomerID(event.target.value);
                    setErrors((previous) => ({ ...previous, customerID: undefined }));
                  }}
                  placeholder="0"
                  className={`${inputBase} text-xs sm:text-sm ${errors.customerID ? "border-rose-500" : "border-slate-200"}`}
                />
                {errors.customerID && <span className="mt-1 block text-[11px] text-rose-600">{errors.customerID}</span>}
              </div>
            )}

            <div className="w-full min-w-[220px] sm:max-w-[400px] sm:flex-[0_1_160px] lg:flex-[0_1_300px]">
              <label className={labelBase}>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setErrors((previous) => ({ ...previous, amount: undefined }));
                }}
                placeholder="0.00"
                className={`${inputBase} text-xs sm:text-sm ${errors.amount ? "border-rose-500" : "border-slate-200"}`}
              />
              {errors.amount && <span className="mt-1 block text-[11px] text-rose-600">{errors.amount}</span>}
            </div>
          </div>

          <div className="mt-4">
            <label className={labelBase}>Reference</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <textarea
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Enter reference / narration..."
                rows={2}
                className={`${inputBase} resize-none leading-6 text-xs sm:text-sm`}
              />
              <button
                type="button"
                onClick={addEntry}
                className="rounded-lg border-0 bg-gradient-to-br from-amber-400 to-amber-600 px-4 sm:px-7 py-2.5 sm:py-2 text-xs sm:text-[13px] font-semibold tracking-[0.04em] text-white shadow-sm transition hover:brightness-105 sm:whitespace-nowrap"
              >
                + Add to List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${sectionBase} mb-5`}>
        <div className="flex items-center justify-between border-b border-amber-100 bg-[#23314d] px-4 sm:px-6 py-3 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
          <span>GL Entry List</span>
          <span className="font-normal text-slate-500 text-[9px] sm:text-xs">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {[
                  "",
                  "GL Head",
                  "Debit",
                  "Credit",
                  "Reference",
                ].map((header, index) => (
                  <th
                    key={index}
                    className={`whitespace-nowrap bg-slate-50 px-3 sm:px-5 py-2 sm:py-3 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 ${
                      index >= 2 && index <= 3 ? "text-right" : "text-left"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 sm:px-5 py-6 sm:py-8 text-center text-[12px] sm:text-[13px] italic text-slate-500">
                    No entries added yet
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                  >
                    <td className="w-16 sm:w-20 px-2 sm:px-5 py-2 sm:py-3">
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="cursor-pointer rounded-md border border-rose-200 bg-rose-50 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] text-rose-700 transition hover:bg-rose-100 w-full sm:w-auto"
                      >
                        Remove
                      </button>
                    </td>
                    <td className="px-3 sm:px-5 py-2 sm:py-3 text-[11px] sm:text-[13px] text-slate-800 truncate">{entry.headName}</td>
                    <td className={`px-3 sm:px-5 py-2 sm:py-3 text-right text-[11px] sm:text-[13px] tabular-nums ${entry.type === "Debit" ? "text-rose-600" : "text-slate-500"}`}>
                      {entry.type === "Debit" ? entry.amount.toLocaleString() : ""}
                    </td>
                    <td className={`px-3 sm:px-5 py-2 sm:py-3 text-right text-[11px] sm:text-[13px] tabular-nums ${entry.type === "Credit" ? "text-emerald-600" : "text-slate-500"}`}>
                      {entry.type === "Credit" ? entry.amount.toLocaleString() : ""}
                    </td>
                    <td className="hidden sm:table-cell max-w-[200px] px-5 py-3 text-ellipsis whitespace-nowrap text-[12px] text-slate-500 truncate">
                      {entry.reference}
                    </td>
                  </tr>
                ))
              )}

              {entries.length > 0 && (
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={2} className="px-3 sm:px-5 py-2 sm:py-3 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Total
                  </td>
                  <td className={`px-3 sm:px-5 py-2 sm:py-3 text-right text-[11px] sm:text-[14px] font-semibold tabular-nums ${balanced ? "text-emerald-600" : "text-rose-600"}`}>
                    {totalDebit.toLocaleString()}
                  </td>
                  <td className={`px-3 sm:px-5 py-2 sm:py-3 text-right text-[11px] sm:text-[14px] font-semibold tabular-nums ${balanced ? "text-emerald-600" : "text-rose-600"}`}>
                    {totalCredit.toLocaleString()}
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3">
                    <span className={`text-[11px] font-semibold ${balanced ? "text-emerald-600" : "text-rose-600"}`}>
                      {balanced ? "✓ Balanced" : `Diff: ${balanceDifference.toLocaleString()}`}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex w-full max-w-[1100px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        {apiLoadError && (
          <span className="text-xs text-rose-600">⚠ {apiLoadError}</span>
        )}
        {!isLoadingOptions && branchOptions.length === 0 && (
          <span className="text-xs text-rose-600">⚠ No branches available</span>
        )}
        {!isLoadingOptions && glHeadOptions.length === 0 && (
          <span className="text-xs text-rose-600">⚠ No GL heads available</span>
        )}
        {!balanced && entries.length > 0 && (
          <span className="text-xs text-rose-600">⚠ Debit and Credit must balance before saving</span>
        )}
        {saved && <span className="text-xs font-semibold text-emerald-600">✓ Voucher saved successfully!</span>}
        <button
          type="button"
          onClick={saveVoucher}
          disabled={!balanced || isSubmitting || isLoadingOptions || branchOptions.length === 0 || glHeadOptions.length === 0}
          className={`w-full sm:w-auto rounded-lg border-0 px-6 sm:px-9 py-3 text-xs sm:text-[13px] font-semibold tracking-[0.04em] transition ${
            balanced && !isSubmitting && !isLoadingOptions && branchOptions.length > 0 && glHeadOptions.length > 0
              ? "cursor-pointer bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm hover:brightness-105"
              : "cursor-not-allowed bg-slate-300 text-white"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Voucher"}
        </button>
      </div>
    </div>
  );
}
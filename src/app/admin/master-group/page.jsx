'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { accountingApi, commonApi } from "@/api/api";
import { useDispatch, useSelector } from "react-redux";
import AccountingSetupShell from "@/app/ui/admin/accounting/setup-shell";
import { Btn, Field, Input } from "@/app/ui/admin/accounting/form-controls";
import {
  deleteMasterGroup,
  setGLGroups,
  setGLHeads,
  setMasterGroups,
  selectGLGroups,
  selectGLHeads,
  selectMasterGroups,
} from "@/app/redux/accounting/accountingSlice";

const emptyForm = { masterGroupName: "", masterGroupNepali: "" };

function isNameAvailable(columnName, value) {
  const tableName = "MasterGroup";
  const [nameError, setNameError] = useState(null);

  const checkAvailability = commonApi.checkDuplicate({ tableName, columnName, value });

  if (checkAvailability) {
    setNameError("This group name is already taken.");
  } else {
    setNameError("");
  }
}

export default function MasterGroupPage() {
  const dispatch = useDispatch();
  const masterGroups = useSelector(selectMasterGroups);
  const glGroups = useSelector(selectGLGroups);
  const glHeads = useSelector(selectGLHeads);

  const counts = useMemo(
    () => ({
      masterGroups: masterGroups.length,
      glGroups: glGroups.length,
      glHeads: glHeads.length,
    }),
    [masterGroups.length, glGroups.length, glHeads.length]
  );

  const isAvailable = async (columnName, value, errorKey) => {
    const tableName = "MasterGroup";

    const checkAvailability = await commonApi.checkDuplicate({ tableName, columnName, value });

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
      return;
    }

    if (checkAvailability.isAvailable === false) {
      setErrors((prev) => ({ ...prev, [errorKey]: checkAvailability.message || "Not available." }));
    } else {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const loadAccountingData = useCallback(async () => {
    setIsLoadingData(true);
    setApiError("");

    try {
      const [masters, groups, heads] = await Promise.all([
        accountingApi.getMasterGroups(),
        accountingApi.getGLGroups(),
        accountingApi.getGLHeads(),
      ]);

      dispatch(setMasterGroups(masters));
      dispatch(setGLGroups(groups));
      dispatch(setGLHeads(heads));
    } catch (error) {
      setApiError(error?.message || "Failed to load accounting data.");
    } finally {
      setIsLoadingData(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadAccountingData();
  }, [loadAccountingData]);

  const validate = () => {
    const nextErrors = {};

    if (!form.masterGroupName.trim()) {
      nextErrors.masterGroupName = "Required";
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      masterGroupName: form.masterGroupName.trim(),
      masterGroupNepali: form.masterGroupNepali.trim(),
    };

    setIsSubmitting(true);
    setApiError("");

    try {
      await accountingApi.createMasterGroup({ id: editId, ...payload });
      await loadAccountingData();

      setForm(emptyForm);
      setErrors({});
      setEditId(null);
    } catch (error) {
      setApiError(error?.message || "Failed to save master group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (group) => {
    setForm({
      masterGroupName: group.masterGroupName || "",
      masterGroupNepali: group.masterGroupNepali || "",
    });
    setEditId(group.id);
    setErrors({});
  };

  const handleDelete = (masterGroupId) => {
    dispatch(deleteMasterGroup(masterGroupId));

    if (editId === masterGroupId) {
      setForm(emptyForm);
      setEditId(null);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
  };

  return (
    <AccountingSetupShell
      title="GL Account Setup"
      description="Create top-level master groups. GL groups and heads are organized below these."
      counts={counts}
    >
      <div className="mb-5 sm:mb-6">
        <h2 className="mb-1 text-xl font-bold text-slate-800">Master Groups</h2>
        <p className="text-sm text-slate-600">
          Add account categories such as Assets, Liabilities, Income, and Expenses.
        </p>
      </div>

      {apiError && (
        <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      {isLoadingData && (
        <p className="mb-5 text-sm font-medium text-slate-600">Loading accounting data...</p>
      )}

      <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Create or update master group</p>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Group Name (English)" half>
            <Input
              value={form.masterGroupName}
              onChange={(event) => setForm((prev) => ({ ...prev, masterGroupName: event.target.value }))}
              placeholder="e.g. Assets"
              onBlur={(event) => isAvailable("MasterGroupName", form.masterGroupName, "masterGroupName")}
              className={errors.masterGroupName ? "border-red-600" : ""}
            />
            {errors.masterGroupName && <p className="mt-1 text-xs text-red-600">{errors.masterGroupName}</p>}
          </Field>

          <Field label="Group Name (Nepali)" half>
            <Input
              value={form.masterGroupNepali}
              onChange={(event) => setForm((prev) => ({ ...prev, masterGroupNepali: event.target.value }))}
              onBlur={(event) => isAvailable("MasterGroupNepali", form.masterGroupNepali, "masterGroupNepali")}
              placeholder="Optional"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          <Btn onClick={handleSubmit} className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editId ? "Update Group" : "Add Group"}
          </Btn>
          {editId && (
            <Btn onClick={handleCancel} variant="secondary" className="w-full sm:w-auto" disabled={isSubmitting}>
              Cancel
            </Btn>
          )}
        </div>
      </div>

      <div className="border-t border-[color:var(--color-border-tertiary)] pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
          All master groups ({masterGroups.length})
        </p>

        <div className="flex flex-col gap-2">
          {masterGroups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-xs font-semibold text-blue-700">
                  {(group.masterGroupName || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{group.masterGroupName}</p>
                  {group.masterGroupNepali && (
                    <p className="text-xs text-slate-600">{group.masterGroupNepali}</p>
                  )}
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-1.5">
                <Btn onClick={() => handleEdit(group)} variant="secondary" small className="w-full sm:w-auto">
                  Edit
                </Btn>
                <Btn onClick={() => handleDelete(group.id)} variant="danger" small className="w-full sm:w-auto">
                  Delete
                </Btn>
              </div>
            </div>
          ))}

          {masterGroups.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-600">
              No master groups added yet.
            </p>
          )}
        </div>
      </div>
    </AccountingSetupShell>
  );
}
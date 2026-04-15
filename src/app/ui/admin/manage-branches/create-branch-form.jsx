"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { branchApi } from "@/api/api";
import { showAdminErrorToast, showAdminSuccessToast } from "@/app/lib/admin-toast";

const initialState = {
  registerDate: "",
  registrationNumber: "",
  branchCode: "",
  branchName: "",
  branchNameNep: "",
  nickName: "",
  street: "",
  district: "",
  zone: "",
  province: "",
  country: "",
  zipCode: "",
  url: "",
  phoneNumber: "",
  faxNumber: "",
  cellNumber: "",
  email: "",
  panNumber: "",
};

const requiredFields = ["registerDate"];

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
    />
  );
}

function SectionHeading({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3">
      <span className="text-base">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export default function CreateBranchForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    requiredFields.forEach((f) => {
      if (!form[f]) errs[f] = "This field is required";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }
    if (form.url && !/^https?:\/\/.+/.test(form.url)) {
      errs.url = "URL must start with http:// or https://";
    }
    return errs;
  };

  const buildPayload = () => {
    const toNull = (value) => {
      const normalized = typeof value === "string" ? value.trim() : value;
      return normalized === "" ? null : normalized;
    };

    return {
      registerDate: form.registerDate ? new Date(`${form.registerDate}T00:00:00`).toISOString() : null,
      registrationNumber: toNull(form.registrationNumber),
      branchCode: toNull(form.branchCode),
      branchName: toNull(form.branchName),
      branchNameNep: toNull(form.branchNameNep),
      nickName: toNull(form.nickName),
      street: toNull(form.street),
      district: toNull(form.district),
      zone: toNull(form.zone),
      country: toNull(form.country),
      province: toNull(form.province),
      phoneNumber: toNull(form.phoneNumber),
      faxNumber: toNull(form.faxNumber),
      email: toNull(form.email),
      cellNumber: toNull(form.cellNumber),
      panNumber: toNull(form.panNumber),
      zipCode: toNull(form.zipCode),
      url: toNull(form.url),
    };
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});

    try {
      setIsSubmitting(true);
      await branchApi.createBranch(buildPayload());
      showAdminSuccessToast("Branch created successfully.");
      router.push("/admin/manage-branches");
    } catch (error) {
      showAdminErrorToast(error?.message || "Failed to create branch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialState);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Branch Registration</h1>
          <p className="text-sm text-gray-400 mt-1">
            Fill in the details to register a new branch.{" "}
            <span className="text-red-400">*</span> Required fields.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* Basic Info */}
          <SectionHeading icon="🏢" title="Basic info" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Register date" required error={errors.registerDate}>
              <Input type="date" value={form.registerDate} onChange={set("registerDate")} />
            </Field>
            <Field label="Registration number" error={errors.registrationNumber}>
              <Input value={form.registrationNumber} onChange={set("registrationNumber")} placeholder="e.g. REG-00123" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <Field label="Branch code" error={errors.branchCode}>
              <Input value={form.branchCode} onChange={set("branchCode")} placeholder="BRN-01" />
            </Field>
            <div className="col-span-2">
              <Field label="Branch name" error={errors.branchName}>
                <Input value={form.branchName} onChange={set("branchName")} placeholder="English name" />
              </Field>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Branch name (Nepali)" error={errors.branchNameNep}>
              <Input value={form.branchNameNep} onChange={set("branchNameNep")} placeholder="नेपाली नाम" />
            </Field>
            <Field label="Nickname" error={errors.nickName}>
              <Input value={form.nickName} onChange={set("nickName")} placeholder="Short name" />
            </Field>
          </div>

          {/* Address */}
          <SectionHeading icon="📍" title="Address" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Street" error={errors.street}>
              <Input value={form.street} onChange={set("street")} placeholder="Street / Tole" />
            </Field>
            <Field label="District" error={errors.district}>
              <Input value={form.district} onChange={set("district")} placeholder="e.g. Kaski" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <Field label="Zone" error={errors.zone}>
              <Input value={form.zone} onChange={set("zone")} placeholder="e.g. Gandaki" />
            </Field>
            <Field label="Province" error={errors.province}>
              <Input value={form.province} onChange={set("province")} placeholder="e.g. Province 4" />
            </Field>
            <Field label="Country" error={errors.country}>
              <Input value={form.country} onChange={set("country")} placeholder="Nepal" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="ZIP code" error={errors.zipCode}>
              <Input value={form.zipCode} onChange={set("zipCode")} placeholder="e.g. 33700" />
            </Field>
            <Field label="URL" error={errors.url}>
              <Input type="url" value={form.url} onChange={set("url")} placeholder="https://branch.example.com" />
            </Field>
          </div>

          {/* Contact */}
          <SectionHeading icon="📞" title="Contact" />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Phone number" error={errors.phoneNumber}>
              <Input type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+977-61-..." />
            </Field>
            <Field label="Fax number" error={errors.faxNumber}>
              <Input type="tel" value={form.faxNumber} onChange={set("faxNumber")} placeholder="+977-61-..." />
            </Field>
            <Field label="Cell number" error={errors.cellNumber}>
              <Input type="tel" value={form.cellNumber} onChange={set("cellNumber")} placeholder="+977-98..." />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Email" error={errors.email}>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="branch@example.com" />
            </Field>
            <Field label="PAN number" error={errors.panNumber}>
              <Input value={form.panNumber} onChange={set("panNumber")} placeholder="e.g. 123456789" />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="h-9 px-4 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-9 px-5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Register branch"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-4">
          Audit timestamp (Audit_TS) is recorded automatically on submit.
        </p>
      </div>
    </div>
  );
}
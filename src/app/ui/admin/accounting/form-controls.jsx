"use client";

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full border transition ${
          checked
            ? "border-blue-600 bg-blue-600 shadow-sm"
            : "border-slate-300 bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[23px]" : "left-[2px]"
          }`}
        />
      </button>
      <span className="text-[13px] font-medium text-slate-700 sm:text-sm">{label}</span>
    </label>
  );
}

export function Field({ label, children, half = false }) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`}
    />
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`}
    >
      {children}
    </select>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  small = false,
  type = "button",
  disabled = false,
  className = "",
}) {
  const variants = {
    primary: "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700",
    secondary:
      "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
    danger: "border-red-500 bg-white text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border font-medium shadow-sm transition ${
        small ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm"
      } ${variants[variant]} ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "border-blue-200 bg-blue-100 text-blue-800",
    green: "border-green-200 bg-green-100 text-green-800",
    red: "border-red-200 bg-red-100 text-red-700",
    gray: "border-slate-300 bg-slate-100 text-slate-700",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

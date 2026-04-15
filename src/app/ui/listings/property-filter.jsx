import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  applyPropertyFilters,
  resetPropertyFilters,
  selectPropertyFilters,
  setPropertyFilters,
} from "@/app/redux/property/propertySlice";

// ── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"
    />
    <circle cx="12" cy="8" r="2" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);


const InputField = ({
  placeholder,
  icon,
  value,
  onChange,
}) => (
  <div className="relative flex items-center">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-600 placeholder-gray-400 outline-none transition focus:border-[#e05c4b] focus:ring-2 focus:ring-[#e05c4b]/10"
    />
    <span className="absolute right-4">{icon}</span>
  </div>
);

const SelectField = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!selectRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleFocusChange = (event) => {
      if (!selectRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("focusin", handleFocusChange);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-500 outline-none transition hover:border-gray-300 focus:border-[#e05c4b] focus:ring-2 focus:ring-[#e05c4b]/10"
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>
          {value || label}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <li
            className="cursor-pointer px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50"
            onClick={() => handleSelect("")}
          >
            {label}
          </li>
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`cursor-pointer px-4 py-2.5 text-sm transition hover:bg-rose-50 hover:text-[#e05c4b] ${
                value === opt ? "bg-rose-50 text-[#e05c4b]" : "text-gray-600"
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function PropertyFilter() {
  const dispatch = useDispatch();
  const filters = useSelector(selectPropertyFilters);
  const [advancedOpen] = useState(false);

  const set = (key) => (v) =>
    dispatch(setPropertyFilters({ [key]: v }));

  const applyFilters = () => dispatch(applyPropertyFilters());
  const clearFilters = () => dispatch(resetPropertyFilters());

  return (
    <div className="w-full max-w-none rounded-lg border border-slate-200 bg-white p-5 lg:max-w-[320px]">
      <div className="flex flex-col gap-3">
        {/* Keyword */}
        <InputField
          placeholder="keyword"
          icon={<SearchIcon />}
          value={filters.keyword}
          onChange={set("keyword")}
          className="rounded-lg"
        />

        {/* Location */}
        <InputField
          placeholder="Location"
          icon={<LocationIcon />}
          value={filters.location}
          onChange={set("location")}
          className="rounded-lg"
        />

        {/* Sale Option */}
        <SelectField
          label="Sale Option"
          options={["For Sale", "For Rent", "For Lease"]}
          value={filters.saleOption}
          onChange={set("saleOption")}
          className="rounded-lg"
        />

        {/* Property Type */}
        <SelectField
          label="Property Type"
          options={["House", "Apartment", "Condo", "Villa", "Land", "Commercial"]}
          value={filters.propertyType}
          onChange={set("propertyType")}
          className="rounded-lg"
        />

        {/* Price Range */}
        <SelectField
          label="Price Range"
          options={[
            "Under Rs.100,000",
            "Rs.100,000 – Rs.250,000",
            "Rs.250,000 – Rs.500,000",
            "Rs.500,000 – Rs.1,000,000",
            "Over Rs.1,000,000",
          ]}
          value={filters.priceRange}
          onChange={set("priceRange")}
          className="rounded-lg"
        />

        {/* Bathrooms
        <SelectField
          label="Bathrooms"
          options={["1", "2", "3", "4", "5+"]}
          value={filters.bathrooms}
          onChange={set("bathrooms")}
        />

        {/* Bedrooms */}
        {/* <SelectField
          label="Bedrooms"
          options={["1", "2", "3", "4", "5", "6+"]}
          value={filters.bedrooms}
          onChange={set("bedrooms")}
        /> */} 

        {/* Garages
        <SelectField
          label="Garages"
          options={["None", "1", "2", "3+"]}
          value={filters.garages}
          onChange={set("garages")}
        /> */}

        {/* Year Built */}
        {/* <SelectField
          label="Year built"
          options={[
            "Before 1970",
            "1970 – 1990",
            "1990 – 2000",
            "2000 – 2010",
            "2010 – 2020",
            "After 2020",
          ]}
          value={filters.yearBuilt}
          onChange={set("yearBuilt")}
        /> */}

        {/* Min / Max Area */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min Area"
            value={filters.minArea}
            onChange={(e) => set("minArea")(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-600 placeholder-gray-400 outline-none transition focus:border-[#e05c4b] focus:ring-2 focus:ring-[#e05c4b]/10"
          />
          <input
            type="number"
            placeholder="Max Area"
            value={filters.maxArea}
            onChange={(e) => set("maxArea")(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-600 placeholder-gray-400 outline-none transition focus:border-[#e05c4b] focus:ring-2 focus:ring-[#e05c4b]/10"
          />
        </div>

        {/* Advanced Features
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex items-center gap-2 py-1 text-sm font-medium text-[#e05c4b] transition hover:opacity-80"
        >
          <DotsIcon />
          <span>Advanced features</span>
        </button> */}

        {advancedOpen && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            <p className="mb-3 font-medium text-gray-600">Advanced Features</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Swimming Pool",
                "Garden",
                "Air Conditioning",
                "Heating",
                "Fireplace",
                "Gym",
                "Elevator",
                "Security System",
              ].map((feature) => (
                <label key={feature} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-[#e05c4b]"
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={applyFilters}
          className="mt-1 w-full rounded-lg bg-green-500 py-4 text-sm font-semibold tracking-wide text-white transition hover:bg-green-700 active:scale-[0.98]"
        >
          Apply Filters
        </button>

        {/* Clear Filters */}
        <button
          type="button"
          onClick={clearFilters}
          className="mt-1 w-full rounded-lg bg-red-600 py-4 text-sm font-semibold tracking-wide text-white transition hover:bg-red-700 active:scale-[0.98]"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

'use client';

import GoogleMapView from "@/app/ui/map/google-map-view";

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Studio", "Office", "Land", "Townhouse"];
const SALE_OPTIONS = ["sale", "rent", "For Lease"];
const AMENITIES = [
  { icon: "❄️", label: "Air Conditioning" },
  { icon: "🏊", label: "Swimming Pool" },
  { icon: "🏋️", label: "Gym" },
  { icon: "🚗", label: "Parking" },
  { icon: "🌿", label: "Garden" },
  { icon: "🔥", label: "Fireplace" },
  { icon: "🛗", label: "Elevator" },
  { icon: "🔒", label: "Security" },
  { icon: "🛋️", label: "Furnished" },
  { icon: "🐾", label: "Pet Friendly" },
  { icon: "🏠", label: "Balcony" },
  { icon: "☀️", label: "Rooftop" },
];

const INPUT_CLASS = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const CARD_CLASS = "mb-5 rounded-2xl border border-slate-100 bg-white p-7 shadow-sm";
const SECTION_TITLE_CLASS = "mb-5 border-b border-slate-100 pb-4 text-[15px] font-bold text-slate-800";

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
      {label}
      {required && <span className="ml-1 text-indigo-500">*</span>}
    </label>
    {children}
  </div>
);

const CounterField = ({ label, value, onChange, min = 0, max = 20 }) => (
  <Field label={label}>
    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-11 w-10 text-xl font-medium text-indigo-500 transition hover:bg-indigo-50"
      >
        -
      </button>
      <span className="flex-1 text-center text-[15px] font-semibold text-slate-800">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-11 w-10 text-xl font-medium text-indigo-500 transition hover:bg-indigo-50"
      >
        +
      </button>
    </div>
  </Field>
);

const SelectField = ({ label, required, value, onChange, options }) => (
  <Field label={label} required={required}>
    <div className="relative">
      <select value={value} onChange={onChange} className={`${INPUT_CLASS} appearance-none pr-10`}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </Field>
);

export default function PropertyForm({
  values,
  actions,
  selectedMapPosition,
  onLocationSelect,
  canSubmit,
  submitting,
  submitError,
  onSubmit,
  fileRef,
  coverFileRef,
  submitLabel = "Add Property",
  submittingLabel = "Submitting...",
}) {
  const {
    title,
    type,
    saleOption,
    price,
    pricePeriod,
    description,
    address,
    city,
    stateProvince,
    latitude,
    longitude,
    beds,
    baths,
    parking,
    area,
    condition,
    furnishing,
    amenities,
    coverImage,
    images,
    coverDragging,
    dragging,
    isFeatured,
    listingStatus,
  } = values;

  const {
    setTitle,
    setType,
    setSaleOption,
    setPrice,
    setPricePeriod,
    setDescription,
    setAddress,
    setCity,
    setStateProvince,
    setLatitude,
    setLongitude,
    setBeds,
    setBaths,
    setParking,
    setArea,
    setCondition,
    setFurnishing,
    toggleAmenity,
    setCoverDragging,
    onCoverDrop,
    addCoverImage,
    removeCoverImage,
    setDragging,
    onDrop,
    addImages,
    removeImageAt,
    setIsFeatured,
    setListingStatus,
  } = actions;

  return (
    <div className="w-full">
      <div className={CARD_CLASS}>
        <h2 className={SECTION_TITLE_CLASS}>Property details</h2>
        <div className="grid gap-5">
          <Field label="Listing title" required>
            <input
              className={INPUT_CLASS}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern 3-Bedroom Apartment in Central Park Area"
            />
          </Field>
          <Field label="Property type" required>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
              {PROPERTY_TYPES.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setType(option)}
                  className={`rounded-xl border px-4 py-2 text-[13px] font-semibold transition ${type === option ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Sale option" required>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
              {SALE_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setSaleOption(option)}
                  className={`rounded-xl border px-5 py-2 text-[13px] font-semibold transition ${saleOption === option ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            <Field label="Price" required>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400">Rs.</span>
                <input
                  className={`${INPUT_CLASS} pl-12`}
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </Field>
            <SelectField
              label="Price period"
              value={pricePeriod}
              onChange={(e) => setPricePeriod(e.target.value)}
              options={["Per Month", "Per Year", "Fixed Price"]}
            />
          </div>
          <Field label="Description">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${INPUT_CLASS} resize-none leading-relaxed`}
              placeholder="Describe your property highlights, nearby landmarks, recent upgrades"
            />
          </Field>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Cover photo</p>
              <span className="text-xs text-slate-400">1 image</span>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
              onDragLeave={() => setCoverDragging(false)}
              onDrop={onCoverDrop}
              onClick={() => coverFileRef.current.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${coverDragging ? "border-indigo-500 bg-indigo-50" : "border-indigo-200 bg-slate-50"}`}
            >
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => addCoverImage(e.target.files)}
              />
              <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
                <svg width={22} height={22} fill="none" stroke="#6366f1" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="mb-1 text-sm font-bold text-slate-600">Drag & drop cover photo</p>
              <p className="text-[13px] text-slate-400">or <span className="font-semibold text-indigo-500">browse file</span> (PNG, JPG, WEBP)</p>
            </div>
            {coverImage && (
              <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage.url} alt={coverImage.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-0 bg-white/90 transition hover:bg-white"
                  aria-label="Remove cover photo"
                >
                  <svg width={12} height={12} fill="none" stroke="#475569" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <h2 className={SECTION_TITLE_CLASS}>Address</h2>
        <div className="grid gap-5">
          <Field label="Street address" required>
            <input
              className={INPUT_CLASS}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 742 Evergreen Terrace"
            />
          </Field>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <Field label="City" required>
              <input
                className={INPUT_CLASS}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kathmandu"
              />
            </Field>
            <Field label="State / Province">
              <input
                className={INPUT_CLASS}
                value={stateProvince}
                onChange={(e) => setStateProvince(e.target.value)}
                placeholder="e.g. Bagmati"
              />
            </Field>
            <Field label="Latitude">
              <input
                className={INPUT_CLASS}
                placeholder="e.g. 40.7128"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </Field>
            <Field label="Longitude">
              <input
                className={INPUT_CLASS}
                placeholder="e.g. -74.0060"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </Field>
          </div>
          <GoogleMapView
            selectedPosition={selectedMapPosition}
            onLocationSelect={onLocationSelect}
          />
          <p className="px-0.5 text-[13px] text-slate-500">
            Click the map or drag the pin to set latitude and longitude automatically.
          </p>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <h2 className={SECTION_TITLE_CLASS}>Property specifications</h2>
        <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-5">
          <CounterField label="Bedrooms" value={beds} onChange={setBeds} min={0} />
          <CounterField label="Bathrooms" value={baths} onChange={setBaths} min={1} />
          <CounterField label="Parking spaces" value={parking} onChange={setParking} />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <Field label="Area (sq ft)">
            <input
              className={INPUT_CLASS}
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. 1,200"
            />
          </Field>
          {["Lot size (sq ft)", "Year built", "Total floors"].map((label) => (
            <Field key={label} label={label}>
              <input
                className={INPUT_CLASS}
                type="number"
                placeholder={label === "Lot size (sq ft)" ? "e.g. 3,500" : label === "Year built" ? "e.g. 2019" : "e.g. 3"}
              />
            </Field>
          ))}
          <SelectField
            label="Condition"
            options={["Excellent", "Good", "Fair", "Needs Renovation"]}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
          <SelectField
            label="Furnishing"
            options={["Unfurnished", "Semi-Furnished", "Fully Furnished"]}
            value={furnishing}
            onChange={(e) => setFurnishing(e.target.value)}
          />
        </div>
      </div>

      <div className={CARD_CLASS}>
        <h2 className={SECTION_TITLE_CLASS}>Amenities & features</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2.5">
          {AMENITIES.map(({ icon, label }) => {
            const isOn = amenities.includes(label);
            return (
              <button
                type="button"
                key={label}
                onClick={() => toggleAmenity(label)}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition ${isOn ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"}`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${isOn ? "bg-indigo-200" : "bg-slate-100"}`}>{icon}</div>
                <span className={`text-[13px] font-semibold ${isOn ? "text-indigo-700" : "text-slate-500"}`}>{label}</span>
                {isOn && (
                  <svg className="ml-auto h-3.5 w-3.5 shrink-0" fill="none" stroke="#6366f1" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={CARD_CLASS}>
        <h2 className={SECTION_TITLE_CLASS}>Additional photos</h2>
        <p className="-mt-3 mb-5 text-[13px] text-slate-400">Upload extra images to showcase the property.</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current.click()}
          className={`mb-5 cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${dragging ? "border-indigo-500 bg-indigo-50" : "border-indigo-200 bg-slate-50"}`}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => addImages(e.target.files)}
          />
          <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
            <svg width={26} height={26} fill="none" stroke="#6366f1" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <p className="mb-1 text-sm font-bold text-slate-600">Drag & drop photos here</p>
          <p className="text-[13px] text-slate-400">or <span className="font-semibold text-indigo-500">browse files</span> (PNG, JPG, WEBP up to 10 MB each)</p>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
            {images.map(({ url, name }, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImageAt(i)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-0 bg-white/90 transition hover:bg-white"
                >
                  <svg width={12} height={12} fill="none" stroke="#475569" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <div
              onClick={() => fileRef.current.click()}
              className="flex min-h-[120px] aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50"
            >
              <svg width={24} height={24} fill="none" stroke="#94a3b8" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </div>
          </div>
        )}
      </div>

      <div className={`${CARD_CLASS} flex flex-wrap items-start gap-3`}>
        <input
          type="checkbox"
          id="isFeatured"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-indigo-500"
        />
        <label htmlFor="isFeatured" className="mr-4 cursor-pointer text-[13px] leading-6 text-slate-500">
          Mark as featured.
        </label>
        <input
          type="checkbox"
          id="listingStatus"
          checked={listingStatus}
          onChange={(e) => setListingStatus(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-indigo-500"
        />
        <label htmlFor="listingStatus" className="cursor-pointer text-[13px] leading-6 text-slate-500">
          Listing is active.
        </label>
      </div>

      {submitError && (
        <p className="mb-1 mt-[-4px] text-[13px] text-red-600">{submitError}</p>
      )}

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className={`min-w-[180px] rounded-xl px-4 py-3 text-sm font-bold text-white transition ${!canSubmit || submitting ? "cursor-not-allowed bg-slate-300" : "bg-indigo-500 hover:bg-indigo-600"}`}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}

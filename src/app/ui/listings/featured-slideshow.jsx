/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback, useMemo } from "react";
import { propertyApi } from "@/api/api";
import { nunito } from "../fonts";


const FEATURED_FALLBACK_IMAGE =
  "https://www.publicdomainpictures.net/pictures/100000/velka/new-home-for-sale-1405784329d8m.jpg";
const PROPERTY_IMAGE_BASE_URL = "https://localhost:7018/api/uploads/property_images";

const normalizeFeaturedProperties = (response) => {
  const rawList = Array.isArray(response) ? response : response ? [response] : [];

  return rawList.map((property, index) => {
    const numericPrice = Number(property.price) || 0;
    const saleOption = typeof property.saleOption === "string" ? property.saleOption.trim() : "";
    const coverPhoto = typeof property.coverPhoto === "string" ? property.coverPhoto.trim() : "";
    const image = !coverPhoto || coverPhoto === "no-image-available"
      ? FEATURED_FALLBACK_IMAGE
      : coverPhoto.startsWith("http://") || coverPhoto.startsWith("https://")
        ? coverPhoto
        : `${PROPERTY_IMAGE_BASE_URL}/${coverPhoto}`;

    return {
      id: property.id || `featured-${index}`,
      image,
      title: property.title || "Featured Property",
      price: `Rs.${numericPrice.toLocaleString()}`,
      priceSuffix: saleOption.toLowerCase().includes("rent") ? "/mo" : "",
      badges: saleOption
        ? [{ label: "Featured", variant: "dark" }, { label: saleOption, variant: "red" }]
        : [{ label: "Featured", variant: "dark" }],
    };
  });
};

// ── Badge color map ──────────────────────────────────────────────────────────

const badgeColors= {
  dark: "bg-slate-700/85 text-white",
  red: "bg-red-500 text-white",
  green: "bg-emerald-500/90 text-white",
  blue: "bg-sky-500/90 text-white",
};

// ── Arrow icons ──────────────────────────────────────────────────────────────

const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
);


export default function FeaturedSlideshow({ autoPlayInterval = 4000 }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("right");
  const [isAnimating, setIsAnimating] = useState(false);
  const [properties, setProperties] = useState([]);

  const total = properties.length;

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await propertyApi.getLatestFeatured();
        setProperties(normalizeFeaturedProperties(response));
      } catch (error) {
        console.error("Error fetching featured properties:", error);
        setProperties([]);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const safeCurrent = useMemo(() => {
    if (!total) {
      return 0;
    }

    return current % total;
  }, [current, total]);

  const goTo = useCallback(
    (index, dir) => {
      if (isAnimating || index === safeCurrent) return;
      setDirection(dir ?? (index > safeCurrent ? "right" : "left"));
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [safeCurrent, isAnimating]
  );

  const next = useCallback(() => {
    if (!total) return;
    const nextIdx = (safeCurrent + 1) % total;
    setDirection("right");
    setIsAnimating(true);
    setCurrent(nextIdx);
    setTimeout(() => setIsAnimating(false), 500);
  }, [safeCurrent, total]);

  const prev = useCallback(() => {
    if (!total) return;
    const prevIdx = (safeCurrent - 1 + total) % total;
    setDirection("left");
    setIsAnimating(true);
    setCurrent(prevIdx);
    setTimeout(() => setIsAnimating(false), 500);
  }, [safeCurrent, total]);

  // Auto-play
  useEffect(() => {
    if (autoPlayInterval <= 0 || total <= 1) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [next, autoPlayInterval, total]);

  if (total === 0) {
    return (
      <div className={`${nunito.className} w-full max-w-[480px] mx-auto bg-white rounded-lg border border-slate-200 p-6 shadow-lg`}>
        <h2 className="text-center text-xl font-semibold text-slate-700 mb-3">
          Featured Properties
        </h2>
        <p className="text-center text-sm text-slate-500">No featured properties available.</p>
      </div>
    );
  }

  const prop = properties[safeCurrent];

  return (
    <div className={`${nunito.className} w-full max-w-[480px] mx-auto bg-white rounded-lg border border-slate-200 pt-1 pb-3 shadow-lg`}>
      {/* Title */}
      <h2 className="text-xl font-semibold text-slate-700 pl-4 mt-2">
        Featured Properties
      </h2>

      {/* Slide container */}
      <div className="relative group">
        {/* Card */}
        <div className="relative overflow-hidden m-4 rounded-lg shadow-lg aspect-[4/3]">
          {/* Images – all stacked, only current visible */}
          {properties.map((p, i) => (
            <img
              key={p.id}
              src={p.image}
              alt={p.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-2000 ease-in-out ${
                i === safeCurrent
                  ? "opacity-100"
                  : direction === "right"
                  ? "opacity-0 scale-100"
                  : "opacity-0 scale-100"
              }`}
            />
          ))}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges */}
          <div
            className={`absolute top-4 left-4 flex gap-2 transition-all duration-500 ${
              isAnimating
                ? "opacity-0 -translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            {prop.badges.map((b, i) => (
              <span
                key={i}
                className={`px-3 py-1 text-xs font-semibold rounded ${badgeColors[b.variant]}`}
              >
                {b.label}
              </span>
            ))}
          </div>

          {/* Price & title */}
          <div
            className={`absolute bottom-5 left-5 right-5 transition-all duration-500 ${
              isAnimating
                ? "opacity-0 translate-y-3"
                : "opacity-100 translate-y-0"
            }`}
          >
            <p className="text-white text-xl font-bold drop-shadow-lg">
              {prop.price}
              {prop.priceSuffix && (
                <span className="text-base font-normal text-gray-200">
                  {prop.priceSuffix}
                </span>
              )}
            </p>
            <p className="text-white text-sm font-semibold mt-0.5 drop-shadow-lg">
              {prop.title}
            </p>
          </div>
        </div>

        {/* Navigation arrows – appear on hover */}
        <button
          onClick={prev}
          className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={next}
          className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-4 mt-6 mb-3">
        {properties.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === safeCurrent
                ? "w-2.5 h-2.5 bg-slate-700"
                : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

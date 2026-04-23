'use client';

import ListingCard from "@/app/ui/listings/listing-card";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ListFilter, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    applyPropertyFilters,
    propertyDefaultFilters,
    setPropertyFilters,
    selectPropertyAppliedFilters,
    selectPropertyError,
    selectPropertyList,
    selectPropertyLoading,
    setPropertyError,
    setPropertyList,
    setPropertyLoading,
} from "@/app/redux/property/propertySlice";
import { propertyApi } from "@/api/api";
import PropertyFilter from "@/app/ui/listings/property-filter";
import FeaturedSlideshow from "@/app/ui/listings/featured-slideshow";
import ListingsPagination from "@/app/ui/listings/listings-pagination";
import { ListingGridSkeleton } from "@/app/ui/skeletons";
import { nunito } from "@/app/ui/fonts";
import { getRuntimeConfig } from "@/app/lib/runtime-config";

const PAGE_SIZE = 10;
const FALLBACK_COVER_IMAGE= "https://www.publicdomainpictures.net/pictures/100000/velka/new-home-for-sale-1405784329d8m.jpg";

const getPropertyImageBaseUrl = () => getRuntimeConfig("PROPERTY_IMAGE_BASE_URL")?.trim();

const ListingsPageFallback = () => (
    <div className={nunito.className + " min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-100 to-[#edf2f7]"}>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <section className="mb-6 rounded-lg bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm sm:p-6">
                <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-44 animate-pulse rounded bg-slate-200" />
            </section>

            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="hidden h-[420px] rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-200/70 lg:block" />
                <div className="space-y-4">
                    <div className="h-40 rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-200/70" />
                    <div className="h-40 rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-200/70" />
                    <div className="h-40 rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-200/70" />
                </div>
            </div>
        </main>
    </div>
);

const formatPostedAt = (dateValue) => {
    if (!dateValue) {
        return "";
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getDisplayAddress = (property) => {
    const directAddress = typeof property.address === "string" ? property.address.trim() : "";
    if (directAddress) {
        return directAddress;
    }

    const city = typeof property.city === "string" ? property.city.trim() : "";
    const state = typeof property.state === "string" ? property.state.trim() : "";
    const merged = [city, state].filter(Boolean).join(", ");

    return merged || "Location unavailable";
};

const getListingPrice = (property) => {
    const saleOptionValue = String(property.saleOption || "").toLowerCase();
    const directPrice = Number(property.price);
    if (directPrice > 0) {
        return saleOptionValue.includes("rent")
            ? `${directPrice.toLocaleString()}/mo`
            : directPrice.toLocaleString();
    }

    return "N/A";
};

const getListingImageUrl = (property) => {
    const rawCoverValue = property.coverPhoto;
    const coverValue = typeof rawCoverValue === "string" ? rawCoverValue.trim() : "";

    if (!coverValue || coverValue === "no-image-available") {
        return FALLBACK_COVER_IMAGE;
    }

    if (coverValue.startsWith("http://") || coverValue.startsWith("https://")) {
        return coverValue;
    }

    const propertyImageBaseUrl = getPropertyImageBaseUrl();
    if (propertyImageBaseUrl) {
        return `${propertyImageBaseUrl}/${coverValue}`;
    }

    return FALLBACK_COVER_IMAGE;
};

const parsePriceRange = (range) => {
    if (!range) {
        return { minPrice: null, maxPrice: null };
    }

    if (range.includes("Under")) {
        const maxPrice = Number(range.replace(/[^0-9]/g, ""));
        return { minPrice: null, maxPrice: Number.isNaN(maxPrice) ? null : maxPrice };
    }

    if (range.includes("Over")) {
        const minPrice = Number(range.replace(/[^0-9]/g, ""));
        return { minPrice: Number.isNaN(minPrice) ? null : minPrice, maxPrice: null };
    }

    const values = range.match(/[0-9,]+/g) || [];
    const [minRaw, maxRaw] = values.map((value) => Number(value.replace(/,/g, "")));

    return {
        minPrice: Number.isNaN(minRaw) ? null : minRaw,
        maxPrice: Number.isNaN(maxRaw) ? null : maxRaw,
    };
};

function ListingsPageContent() {
    const searchParams = useSearchParams();
    const [isMobileSidebarMounted, setIsMobileSidebarMounted] = useState(false);
    const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const mobileSidebarRef = useRef(null);

    const dispatch = useDispatch();
    const properties = useSelector(selectPropertyList) || [];
    const appliedFilters = useSelector(selectPropertyAppliedFilters);
    const isLoading = useSelector(selectPropertyLoading);
    const error = useSelector(selectPropertyError);
    const previousAppliedFiltersRef = useRef(appliedFilters);

    useEffect(() => {
        const keyword = searchParams.get("keyword")?.trim() || "";
        const location = searchParams.get("location")?.trim() || "";
        const propertyType = searchParams.get("propertyType")?.trim() || "";
        const priceRange = searchParams.get("priceRange")?.trim() || "";
        const saleOption = searchParams.get("saleOption")?.trim() || "";

        const hasQueryFilters = Boolean(keyword || location || propertyType || priceRange || saleOption);
        if (!hasQueryFilters) {
            return;
        }

        dispatch(setPropertyFilters({
            ...propertyDefaultFilters,
            keyword,
            location,
            propertyType,
            priceRange,
            saleOption,
        }));
        dispatch(applyPropertyFilters());
    }, [dispatch, searchParams]);

    const fetchListings = useCallback(async (pageToFetch = currentPage) => {
        dispatch(setPropertyLoading(true));
        dispatch(setPropertyError(""));

        try {
            const keyword = appliedFilters.keyword?.trim();
            const location = appliedFilters.location?.trim();
            const saleOption = appliedFilters.saleOption === "For Sale" ? "Sale" : appliedFilters.saleOption === "For Rent" ? "Rent" : appliedFilters.saleOption;
            const propertyType = appliedFilters.propertyType?.trim();
            const minAreaValue = Number(appliedFilters.minArea);
            const maxAreaValue = Number(appliedFilters.maxArea);
            const hasMinArea = appliedFilters.minArea !== "" && !Number.isNaN(minAreaValue);
            const hasMaxArea = appliedFilters.maxArea !== "" && !Number.isNaN(maxAreaValue);

            const payload = {
                pageNumber: Math.max(pageToFetch, 1),
                pageSize: PAGE_SIZE,
            };

            if (keyword) {
                payload.keyword = keyword;
            }
            if (location) {
                payload.location = location;
            }
            if (saleOption) {
                payload.saleOption = saleOption;
            }
            if (propertyType) {
                payload.propertyType = propertyType;
            }
            if (appliedFilters.priceRange) {
                const { minPrice, maxPrice } = parsePriceRange(appliedFilters.priceRange);
                if (minPrice !== null) {
                    payload.minPrice = minPrice;
                }
                if (maxPrice !== null) {
                    payload.maxPrice = maxPrice;
                }
            }
            if (hasMinArea) {
                payload.minArea = minAreaValue;
            }
            if (hasMaxArea) {
                payload.maxArea = maxAreaValue;
            }

            const response = await propertyApi.getFiltered(payload);
            const data = Array.isArray(response) ? response : response ? [response] : [];
            const nextTotalCount = Number(
                response?.totalCount
                ?? data?.[0]?.totalCount
                ?? data.length
            ) || 0;

            setTotalCount(nextTotalCount);
            dispatch(setPropertyList(data));
        } catch (error) {
            console.error("Error fetching properties:", error);
            dispatch(setPropertyError("No Properties found matching the selected filters."));
            setTotalCount(0);
            dispatch(setPropertyList([]));
        } finally {
            dispatch(setPropertyLoading(false));
        }
    }, [appliedFilters, currentPage, dispatch]);

    useEffect(() => {
        const filtersChanged = previousAppliedFiltersRef.current !== appliedFilters;

        if (filtersChanged && currentPage !== 1) {
            previousAppliedFiltersRef.current = appliedFilters;
            setCurrentPage(1);
            return;
        }

        previousAppliedFiltersRef.current = appliedFilters;
        fetchListings(currentPage);
    }, [currentPage, appliedFilters, fetchListings]);

    useEffect(() => {
        if (!isMobileSidebarMounted) {
            return undefined;
        }

        const timer = setTimeout(() => {
            if (!isMobileSidebarVisible) {
                setIsMobileSidebarMounted(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [isMobileSidebarMounted, isMobileSidebarVisible]);

    useEffect(() => {
        if (!isMobileSidebarMounted) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileSidebarMounted]);

    useEffect(() => {
        const desktopMedia = window.matchMedia("(min-width: 1024px)");

        const closeSidebarOnDesktop = (event) => {
            if (event.matches) {
                setIsMobileSidebarVisible(false);
                setIsMobileSidebarMounted(false);
            }
        };

        if (desktopMedia.matches) {
            setIsMobileSidebarVisible(false);
            setIsMobileSidebarMounted(false);
        }

        desktopMedia.addEventListener("change", closeSidebarOnDesktop);

        return () => {
            desktopMedia.removeEventListener("change", closeSidebarOnDesktop);
        };
    }, []);

    useEffect(() => {
        if (!isMobileSidebarMounted) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!mobileSidebarRef.current?.contains(event.target)) {
                closeMobileSidebar();
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [isMobileSidebarMounted]);

    const openMobileSidebar = () => {
        if (window.innerWidth >= 1024) {
            return;
        }

        setIsMobileSidebarMounted(true);
        requestAnimationFrame(() => {
            setIsMobileSidebarVisible(true);
        });
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarVisible(false);
    };

    const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
    const showInitialLoader = isLoading && properties.length === 0;
    const showPageUpdating = isLoading && properties.length > 0;

    return (
        <div className={nunito.className + " min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-100 to-[#edf2f7]"}>
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <section className="mb-6 rounded-lg bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-sm sm:p-6">
                    <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Property Listings</h1>
                    <p className="mt-2 text-sm text-slate-600 sm:text-base">
                        Discover homes that match your preferences. Use the filters to narrow down your search and find the perfect property for you.
                    </p>
                    <p className="mt-3 text-sm font-semibold text-[#e05c4b]">
                        Showing {properties.length} of {totalCount} listings
                    </p>
                </section>

                <div className="mb-6 flex justify-end lg:hidden">
                    <button
                        type="button"
                        onClick={openMobileSidebar}
                        className="inline-flex items-center overflow-hidden rounded-lg shadow-sm"
                        aria-label="Show filters"
                    >
                        <span className="bg-[#dc3f3f] px-4 py-3 text-white">
                            <ListFilter size={24} />
                        </span>
                        <span className="bg-[#ea6363] px-5 py-3 text-base font-semibold text-white">
                            Show Filter
                        </span>
                    </button>
                </div>

                <div className="grid min-w-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
                    <aside className="hidden space-y-6 lg:sticky lg:top-6 lg:block">
                        <PropertyFilter />
                        <FeaturedSlideshow />
                    </aside>

                    <section className="min-w-0">
                        {showInitialLoader && (
                            <ListingGridSkeleton count={6} />
                        )}

                        {!showInitialLoader && error && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm">
                                {error}
                            </div>
                        )}

                        {!showInitialLoader && !error && properties.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                                No listings match the selected filters.
                            </div>
                        )}

                        {!showInitialLoader && !error && properties.length > 0 && (
                            <>
                                <div className="relative">
                                    <div
                                        className={`grid grid-cols-1 gap-6 transition-all duration-300 ease-out md:grid-cols-2 2xl:grid-cols-2 ${showPageUpdating ? "translate-y-1 opacity-30" : "translate-y-0 opacity-100"
                                            }`}
                                    >
                                        {properties.map((property) => {
                                            const propertyId = property.id;
                                            const cardPrice = getListingPrice(property);
                                            const imageUrl = getListingImageUrl(property);

                                            return (
                                                <ListingCard
                                                    key={propertyId}
                                                    propertyId={propertyId}
                                                    price={cardPrice}
                                                    type={property.type}
                                                    title={property.title}
                                                    address={getDisplayAddress(property)}
                                                    sqft={property.area}
                                                    agentName={property.addedBy}
                                                    agentAvatar="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=is&k=20&c=XmEKmysBRbA1o6zWBHLRaX2j_nrYVvdVZjuXPBLuOOo="
                                                    postedAt={formatPostedAt(property.addedOn)}
                                                    isFeatured={property.isFeatured}
                                                    saleOption={property.saleOption}
                                                    imageUrl={imageUrl}
                                                    latitude={property.latitude}
                                                    longitude={property.longitude}
                                                />
                                            );
                                        })}
                                    </div>

                                    {showPageUpdating && (
                                        <div className="pointer-events-none absolute inset-0 rounded-lg bg-white/60 p-1">
                                            <ListingGridSkeleton count={4} />
                                        </div>
                                    )}
                                </div>

                                <ListingsPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    isLoading={isLoading}
                                />
                            </>
                        )}
                    </section>
                </div>
            </main >

            {isMobileSidebarMounted && (
                <div
                    className="fixed inset-0 z-50 transition-opacity duration-300 lg:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Filters sidebar"
                >
                    <button
                        type="button"
                        className={`absolute inset-0 bg-slate-900/45 transition-opacity duration-300 ${isMobileSidebarVisible ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={closeMobileSidebar}
                        aria-label="Close filters"
                    />

                    <div
                        ref={mobileSidebarRef}
                        className={`hide-scrollbar absolute left-0 top-0 h-full w-[88vw] max-w-[360px] overflow-y-auto bg-[#f7f7f8] p-5 shadow-2xl transition-transform duration-300 ease-out ${isMobileSidebarVisible ? "translate-x-0" : "-translate-x-full"
                            }`}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-slate-800">Filters</h2>
                            <button
                                type="button"
                                onClick={closeMobileSidebar}
                                className="rounded-md p-1 text-slate-600 hover:bg-slate-200"
                                aria-label="Close filter sidebar"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <PropertyFilter />
                            <FeaturedSlideshow />
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}

export default function ListingsPage() {
    return (
        <Suspense fallback={<ListingsPageFallback />}>
            <ListingsPageContent />
        </Suspense>
    );
}
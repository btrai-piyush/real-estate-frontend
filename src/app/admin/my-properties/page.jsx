"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Search, List as ListIcon, Table as TableIcon, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { propertyApi } from "@/api/api";
import { showAdminErrorToast, showAdminSuccessToast } from "@/app/lib/admin-toast";
import TableView from "@/app/ui/admin/my-properties/table-view";
import ListView from "@/app/ui/admin/my-properties/list-view";
import {
    removeAdminPropertyById,
    selectAdminPropertyError,
    selectAdminPropertyHasFetched,
    selectAdminPropertyList,
    selectAdminPropertyLoading,
    selectAdminPropertyQuery,
    setAdminPropertyError,
    setAdminPropertyList,
    setAdminPropertyLoading,
    toggleAdminFeaturedByIds,
    toggleAdminListingStatusByIds,
} from "@/app/redux/property/propertySlice";

const SEARCH_DEBOUNCE_MS = 1000;
const ADMIN_FETCH_PAGE_SIZE = "1000";
const COVER_FALLBACK_IMAGE =
    "https://www.publicdomainpictures.net/pictures/100000/velka/new-home-for-sale-1405784329d8m.jpg";

const FILTER_OPTIONS = ["Recent", "Featured First", "Active", "Pending"];

const buildPagination = (page, totalPages) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
        return [1, 2, 3, 4, "...", totalPages];
    }

    if (page >= totalPages - 2) {
        return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

const normalizeBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "true" || normalized === "1" || normalized === "active";
    }
    return false;
};

const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const formatPrice = (price, saleOption) => {
    const numericPrice = Number(price) || 0;
    if (numericPrice <= 0) {
        return "Price on request";
    }

    if (String(saleOption || "").toLowerCase().includes("rent")) {
        return `Rs.${numericPrice.toLocaleString()}/mo`;
    }

    return `Rs.${numericPrice.toLocaleString()}`;
};

const getCoverImageUrl = (coverPhoto) => {
    const coverValue = typeof coverPhoto === "string" ? coverPhoto.trim() : "";

    if (!coverValue || coverValue === "no-image-available") {
        return COVER_FALLBACK_IMAGE;
    }

    if (coverValue.startsWith("http://") || coverValue.startsWith("https://")) {
        return coverValue;
    }

    return `https://localhost:7018/api/uploads/property_images/${coverValue}`;
};

const normalizeProperty = (property, index) => {
    const saleOption = property?.saleOption || "sale";
    const listingStatus = normalizeBoolean(property?.listingStatus);
    const location = property?.address || [property?.city, property?.state].filter(Boolean).join(", ") || "Location unavailable";

    return {
        id: property?.id || `property-${index}`,
        title: property?.title || "Untitled Property",
        imageUrl: getCoverImageUrl(property?.coverPhoto),
        location,
        latitude: Number(property?.latitude) || 0,
        longitude: Number(property?.longitude) || 0,
        datePublished: property?.addedOn || null,
        saleOption,
        listingStatus,
        views: Number(property?.views ?? 0) || 0,
        isFeatured: Boolean(property?.isFeatured),
        displayPrice: formatPrice(property?.price, saleOption),
    };
};

const extractResultData = (response) => {
    const data = Array.isArray(response) ? response : response ? [response] : [];

    const totalCount = Number(
        response?.totalCount ?? data?.[0]?.totalCount ?? data.length
    ) || 0;

    return { data, totalCount };
};

export default function MyPropertiesPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const properties = useSelector(selectAdminPropertyList);
    const loading = useSelector(selectAdminPropertyLoading);
    const error = useSelector(selectAdminPropertyError);
    const hasFetched = useSelector(selectAdminPropertyHasFetched);
    const lastQuery = useSelector(selectAdminPropertyQuery);

    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("Recent");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewType, setViewType] = useState("table");
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(keyword.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        let mounted = true;

        const fetchProperties = async () => {
            const normalizedKeyword = debouncedKeyword;
            const normalizedFilter = selectedFilter?.trim() || "Recent";

            const sameQueryAsCached =
                lastQuery?.keyword === normalizedKeyword &&
                lastQuery?.filter === normalizedFilter;

            if (sameQueryAsCached && hasFetched) {
                return;
            }

            dispatch(setAdminPropertyLoading(true));
            dispatch(setAdminPropertyError(""));

            try {
                const payload = {
                    pageSize: ADMIN_FETCH_PAGE_SIZE,
                    pageNumber: 1,
                };

                if (normalizedKeyword) {
                    payload.keyword = normalizedKeyword;
                }

                if (normalizedFilter && normalizedFilter !== "Recent" && normalizedFilter !== "Featured First") {
                    payload.filter = normalizedFilter;
                }

                const response = await propertyApi.getAdminAll(payload);

                const { data, totalCount } = extractResultData(response);

                if (!mounted) return;

                const normalizedProperties = data.map(normalizeProperty);

                if (normalizedFilter === "Featured First") {
                    normalizedProperties.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
                }

                if (normalizedFilter === "Recent") {
                    normalizedProperties.sort((a, b) => new Date(b.datePublished || 0) - new Date(a.datePublished || 0));
                }

                dispatch(setAdminPropertyList({
                    list: normalizedProperties,
                    totalCount,
                    keyword: normalizedKeyword,
                    filter: normalizedFilter,
                }));
            } catch (err) {
                if (!mounted) return;
                dispatch(setAdminPropertyError(err?.message || "Failed to load properties."));
                dispatch(setAdminPropertyList({
                    list: [],
                    totalCount: 0,
                    keyword: normalizedKeyword,
                    filter: normalizedFilter,
                }));
            } finally {
                if (mounted) {
                    dispatch(setAdminPropertyLoading(false));
                }
            }
        };

        fetchProperties();

        return () => {
            mounted = false;
        };
    }, [debouncedKeyword, selectedFilter, hasFetched, lastQuery, dispatch]);

    const handleDelete = (id) => {
        setItemToDelete(id);
    };

    const handleEdit = (id) => {
        if (!id) return;
        router.push(`/admin/my-properties/edit.jsx?id=${encodeURIComponent(String(id))}`);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await propertyApi.delete(itemToDelete);
            showAdminSuccessToast("Property successfully deleted.");
            dispatch(removeAdminPropertyById(itemToDelete));
        } catch (err) {
            console.error("Failed to delete property:", err);
            showAdminErrorToast("Failed to delete property. Please try again.");
        } finally {
            setItemToDelete(null);
        }
    };

    const cancelDelete = () => {
        setItemToDelete(null);
    };

    const handleToggleFeatured = async (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) return;

        try {
            await propertyApi.toggleFeatured(ids);
            showAdminSuccessToast(`Featured status toggled for ${ids.length} propert${ids.length > 1 ? "ies" : "y"}.`);
            dispatch(toggleAdminFeaturedByIds(ids));
        } catch (err) {
            console.error("Failed to toggle featured status:", err);
            showAdminErrorToast("Failed to toggle featured status. Please try again.");
        }
    };

    const handleToggleStatus = async (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) return;

        try {
            await propertyApi.toggleListingStatus(ids);
            showAdminSuccessToast(`Listing status toggled for ${ids.length} propert${ids.length > 1 ? "ies" : "y"}.`);
            dispatch(toggleAdminListingStatusByIds(ids));
        } catch (err) {
            console.error("Failed to toggle listing status:", err);
            showAdminErrorToast("Failed to toggle listing status. Please try again.");
        }
    };

    const itemsPerPage = viewType === "table" ? 10 : 50;
    const effectiveTotalCount = properties.length;
    const totalPages = Math.max(Math.ceil(effectiveTotalCount / itemsPerPage), 1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleProperties = properties.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedKeyword, selectedFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const paginationItems = buildPagination(currentPage, totalPages);

        return (
            <nav className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3" aria-label="My properties pagination">
                <button
                    type="button"
                    aria-label="Previous page"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#e85d5d] hover:text-[#e85d5d] disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
                >
                    <ChevronLeft size={20} className="sm:h-[22px] sm:w-[22px]" />
                </button>

                {paginationItems.map((item, index) => {
                    if (item === "...") {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#7085aa] bg-white text-base text-[#3a4b6a] sm:h-12 sm:w-12 sm:text-xl"
                            >
                                ...
                            </span>
                        );
                    }

                    const page = Number(item);
                    const isActive = page === currentPage;

                    return (
                        <button
                            type="button"
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            aria-current={isActive ? "page" : undefined}
                            className={`h-10 w-10 rounded-full border text-sm font-medium transition-all duration-300 ease-out sm:h-12 sm:w-12 sm:text-lg ${isActive
                                    ? "border-[#de6a67] bg-[#de6a67] text-white shadow-md"
                                    : "border-slate-200 bg-white text-[#3a4b6a] hover:-translate-y-0.5 hover:border-[#e85d5d] hover:text-[#e85d5d]"
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    type="button"
                    aria-label="Next page"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#e85d5d] hover:text-[#e85d5d] disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
                >
                    <ChevronRight size={20} className="sm:h-[22px] sm:w-[22px]" />
                </button>
            </nav>
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] p-4 sm:p-6 lg:p-8 relative">
            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-md scale-100 rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-slate-800">Delete Property?</h3>
                            <p className="mb-6 text-sm text-slate-500">
                                Are you sure you want to delete this property? This action cannot be undone and the property will be permanently removed.
                            </p>
                            <div className="flex w-full gap-3">
                                <button
                                    type="button"
                                    onClick={cancelDelete}
                                    className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <h1 className="text-[34px] font-bold leading-tight text-slate-700">My Properties</h1>
                        <p className="text-sm text-slate-500">
                            We are glad to see you again! {effectiveTotalCount > 0 ? `${effectiveTotalCount} matching results.` : ""}
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <div className="relative w-full sm:w-[280px]">
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Search"
                                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-[#e85d5d] focus:ring-2 focus:ring-[#e85d5d]/20"
                            />
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>

                        <select
                            value={selectedFilter}
                            onChange={(event) => setSelectedFilter(event.target.value)}
                            className="h-10 min-w-[160px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-[#e85d5d] focus:ring-2 focus:ring-[#e85d5d]/20"
                        >
                            {FILTER_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-end mb-4">
                    <button
                        type="button"
                        onClick={() => setViewType("table")}
                        className={`border border-slate-300 items-center rounded-l-md px-4 py-2 text-sm font-medium transition ${
                            viewType === "table" ? "bg-[#23314d] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <TableIcon size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewType("list")}
                        className={`border border-slate-300 border-l-0 items-center rounded-r-md px-4 py-2 text-sm font-medium transition ${
                            viewType === "list" ? "bg-[#23314d] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <ListIcon size={20} />
                    </button>
                </div>

                {viewType === "table" ? (
                    <TableView
                        properties={visibleProperties}
                        loading={loading}
                        error={error}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        formatDate={formatDate}
                    />
                ) : (
                    <ListView
                        properties={visibleProperties}
                        loading={loading}
                        error={error}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onToggleFeatured={handleToggleFeatured}
                        onToggleStatus={handleToggleStatus}
                        formatDate={formatDate}
                    />
                )}

                {renderPagination()}
            </div>
        </div>
    );
}


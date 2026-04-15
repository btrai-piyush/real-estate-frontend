"use client";

import { useState } from "react";
import { Pencil, Trash2, CheckSquare, Map as MapIcon } from "lucide-react";

export default function ListView({ properties, loading, error, onDelete, onEdit, onToggleFeatured, onToggleStatus, formatDate }) {
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    if (loading) {
        return <div className="py-8 text-center text-sm text-slate-500">Loading properties...</div>;
    }

    if (error) {
        return <div className="py-8 text-center text-sm text-red-600">{error}</div>;
    }

    if (!properties || properties.length === 0) {
        return <div className="py-8 text-center text-sm text-slate-500">No properties found.</div>;
    }

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        if (isSelectMode) setSelectedIds([]);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(properties.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Use the CSS grid for all screens, wrapped in horizontal scroll
    const gridCols = isSelectMode 
        ? "grid-cols-[auto_3fr_2fr_1.5fr_1.5fr_1fr_1fr_1fr]" 
        : "grid-cols-[3fr_2fr_1.5fr_1.5fr_1fr_1fr_1fr]";

    return (
        <div>
            {/* Top Action Bar with Select Button */}
            <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                {isSelectMode && (
                    <>
                        <button
                            type="button"
                            disabled={selectedIds.length === 0}
                            onClick={() => onToggleFeatured?.(selectedIds)}
                            className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Toggle Featured ({selectedIds.length})
                        </button>
                        <button
                            type="button"
                            disabled={selectedIds.length === 0}
                            onClick={() => onToggleStatus?.(selectedIds)}
                            className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Toggle Status ({selectedIds.length})
                        </button>
                    </>
                )}
                <button 
                    onClick={toggleSelectMode}
                    className={`flex items-center gap-2 border rounded px-4 py-2 text-sm font-medium transition-colors ${
                        isSelectMode 
                            ? "bg-[#f36b68] border-[#f36b68] text-white hover:bg-red-500" 
                            : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                    <CheckSquare size={18} className={isSelectMode ? "text-white" : "text-slate-400"} />
                    {isSelectMode ? "Cancel Selection" : "Select Multiple"}
                </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="min-w-[1100px] lg:min-w-full">
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 bg-[#23314d] rounded-t-md">
                        <div className={`flex-1 grid ${gridCols} gap-4 items-center`}>
                            {isSelectMode && (
                                <div className="flex items-center justify-center w-5">
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll}
                                        checked={properties.length > 0 && selectedIds.length === properties.length}
                                        className="h-4 w-4 rounded border-slate-300 text-[#f36b68] focus:ring-[#f36b68] cursor-pointer"
                                    />
                                </div>
                            )}
                            <span className="text-xs uppercase tracking-wide font-semibold text-white">Listing title</span>
                            <span className="text-xs uppercase tracking-wide font-semibold text-white">Location</span>
                            <span className="text-xs uppercase tracking-wide font-semibold text-white">Price</span>
                            <span className="text-xs uppercase tracking-wide font-semibold text-white">Date</span>
                            <span className="text-xs uppercase tracking-wide font-semibold text-white">Status</span>
                            <span className="text-xs uppercase tracking-wide font-semibold text-white">Views</span>
                            <span className="text-xs uppercase tracking-wide font-semibold text-white">Action</span>
                        </div>
                    </div>

                    {/* List Rows */}
                    <div className="flex flex-col">
                        {properties.map((property) => (
                            <div 
                                key={property.id} 
                                className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className={`flex-1 grid ${gridCols} gap-4 items-center`}>
                                    {/* Checkbox Column */}
                                    {isSelectMode && (
                                        <div className="flex items-center justify-center w-5">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(property.id)}
                                                onChange={() => handleSelectOne(property.id)}
                                                className="h-4 w-4 rounded border-slate-300 text-[#f36b68] focus:ring-[#f36b68] cursor-pointer"
                                            />
                                        </div>
                                    )}

                                    {/* Column 1: Title & Image & Badges */}
                                    <div className="flex items-center gap-2 pr-2">
                                        {/* <div className="h-5 w-5 shrink-0 rounded bg-slate-100 border border-slate-200 flex flex-col items-center justify-center relative group cursor-pointer">
                                            <ImageIcon size={20} className="text-slate-400" /> */}
                                            
                                            {/* Hover Popup Image */}
                                            {/* <div className="fixed sm:absolute sm:left-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:-translate-x-0 sm:-translate-y-1/2 w-48 h-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 shadow-2xl rounded overflow-hidden pointer-events-none scale-50 group-hover:scale-110">
                                                <img 
                                                    src={property.imageUrl} 
                                                    alt={property.title} 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <span className="absolute left-1.5 top-1.5 rounded bg-[#f36b68] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white z-20 shadow-sm">
                                                    {property.saleOption}
                                                </span>
                                            </div> */}
                                        {/* </div> */}
                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="flex items-center mb-1">
                                                <span className="truncate mr-1 text-base font-semibold text-slate-700" title={property.title}>
                                                    {property.title}
                                                </span>
                                                {property.isFeatured && (
                                                    <span className="shrink-0 mr-1 rounded bg-blue-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                                        F
                                                    </span>
                                                )}
                                                <span className="shrink-0 rounded bg-red-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                                    {property.saleOption=== "Sale" ? "S" : property.saleOption === "Rent" ? "R" : "O"}
                                                    </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Location */}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pr-2">
                                        {/* <MapPin className="h-3.5 w-3.5 shrink-0" /> */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`https://www.google.com/maps?q=${property.latitude||0},${property.longitude||0}`, '_blank');
                                            }}
                                            className="transition-transform cursor-pointer hover:scale-125 text-slate-400 hover:text-slate-600 ml-1"
                                            aria-label="Open location in Google Maps"
                                        >
                                            <MapIcon size={14} className="shrink-0" />
                                        </button>
                                        <span className="truncate max-w-[200px]" title={property.location}>{property.location}</span>
                                        
                                        
                                    </div>

                                    {/* Column 3: Price */}
                                    <span className="text-[15px] font-bold text-[#f36b68] truncate pr-2" title={property.displayPrice}>
                                        {property.displayPrice}
                                    </span>

                                    {/* Column 4: Date */}
                                    <span className="text-sm font-medium text-slate-600">
                                        {formatDate(property.datePublished)}
                                    </span>

                                    {/* Column 5: Status */}
                                    <div>
                                        <span className={`inline-flex rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${
                                            property.listingStatus 
                                                ? "bg-emerald-500" 
                                                : "bg-[#f36b68]"
                                        }`}>
                                            {property.listingStatus ? "Active" : "Pending"}
                                        </span>
                                    </div>

                                    {/* Column 6: Views */}
                                    <span className="text-sm font-medium text-slate-600">
                                        {property.views.toLocaleString()}
                                    </span>

                                    {/* Column 7: Action */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit?.(property.id)}
                                            className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[#f36b68] transition hover:bg-slate-100"
                                            aria-label={`Edit ${property.title}`}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(property.id)}
                                            className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[#f36b68] transition hover:bg-slate-100"
                                            aria-label={`Delete ${property.title}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

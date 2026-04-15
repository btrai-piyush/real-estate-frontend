"use client";

import { Pencil, Trash2, MapPin, Map as MapIcon } from "lucide-react";

export default function TableView({ properties, loading, error, onDelete, onEdit, formatDate }) {
    return (
        <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full border-collapse text-left">
                <thead>
                    <tr className="bg-[#23314d] text-xs uppercase tracking-wide text-white">
                        <th className="px-5 py-4 font-semibold">Listing Title</th>
                        <th className="px-4 py-4 font-semibold">Date Published</th>
                        <th className="px-4 py-4 font-semibold">Listing Status</th>
                        <th className="px-4 py-4 font-semibold">View</th>
                        <th className="px-4 py-4 font-semibold">Action</th>
                    </tr>
                </thead>

                <tbody className="bg-white">
                    {loading && (
                        <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                                Loading properties...
                            </td>
                        </tr>
                    )}

                    {!loading && error && (
                        <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-red-600">
                                {error}
                            </td>
                        </tr>
                    )}

                    {!loading && !error && properties.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                                No properties found.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        !error &&
                        properties.map((property) => (
                            <tr key={property.id} className="border-t border-slate-100 align-middle hover:bg-gray-100">
                                <td className="px-5 py-4">
                                    <div className="flex min-w-[360px] items-center gap-4">
                                        <div className="relative h-30 w-40 shrink-0 overflow-hidden rounded-md bg-slate-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={property.imageUrl} alt={property.title} className="h-full w-full object-cover" />
                                            <span className="absolute left-2 top-2 rounded bg-[#f36b68] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                                {property.saleOption}
                                            </span>
                                            {property.isFeatured && (
                                                <span className="absolute left-2 top-8 rounded bg-blue-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                                    Featured
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-[24px] font-semibold text-slate-700">{property.title}</p>
                                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate">{property.location}</span>
                                            
                                            <button
                                                type="button"
                                                onClick={() => {
                                                        window.open(`https://www.google.com/maps?q=${property.latitude||0},${property.longitude||0}`, '_blank');
                                                }}
                                                className="transition-transform cursor-pointer hover:scale-120"
                                                aria-label="Open location in Google Maps"
                                            >
                                                <MapIcon size={20} className="shrink-0 text-[#717171]/80" />
                                            </button>
                                            </p>
                                            <p className="mt-1.5 text-sm font-semibold text-[#f36b68]">{property.displayPrice}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">{formatDate(property.datePublished)}</td>

                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${property.listingStatus ? "bg-emerald-500" : "bg-[#f36b68]"
                                            }`}
                                    >
                                        {property.listingStatus ? "Active" : "Pending"}
                                    </span>
                                </td>

                                <td className="px-4 py-4 text-sm font-medium text-slate-600">{property.views.toLocaleString()}</td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit?.(property.id)}
                                            className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[#f36b68] transition hover:bg-slate-100"
                                            aria-label={`Edit ${property.title}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(property.id)}
                                            className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[#f36b68] transition hover:bg-slate-100"
                                            aria-label={`Delete ${property.title}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

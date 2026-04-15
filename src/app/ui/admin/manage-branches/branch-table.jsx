"use client";

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
}

const columnCount = 18;

export default function BranchTable({ branches = [], loading = false, error = "", onDelete }) {
    return (
        <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full text-left text-sm">
                <thead>
                    <tr className="bg-[#23314d]  text-xs uppercase tracking-wide text-white">
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Register Date</th>
                        <th className="px-4 py-3 font-semibold">Registration Number</th>
                        <th className="px-4 py-3 font-semibold">Branch Code</th>
                        <th className="px-4 py-3 font-semibold">Branch Name</th>
                        <th className="px-4 py-3 font-semibold">Branch Name (Nepali)</th>
                        <th className="px-4 py-3 font-semibold">Nick Name</th>
                        <th className="px-4 py-3 font-semibold">Street, District, Zone/Province</th>
                        {/* <th className="px-4 py-3 font-semibold">District</th>
                        <th className="px-4 py-3 font-semibold">Zone</th>
                        <th className="px-4 py-3 font-semibold">Province</th> */}
                        <th className="px-4 py-3 font-semibold">Country</th>
                        <th className="px-4 py-3 font-semibold">Phone</th>
                        <th className="px-4 py-3 font-semibold">Fax</th>
                        <th className="px-4 py-3 font-semibold">Cell</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">PAN</th>
                        <th className="px-4 py-3 font-semibold">Zip</th>
                        <th className="px-4 py-3 font-semibold">URL</th>
                        <th className="px-4 py-3 font-semibold">Audit Timestamp</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                </thead>

                <tbody className="bg-white">
                    {loading && (
                        <tr>
                            <td colSpan={columnCount} className="px-5 py-8 text-center text-sm text-slate-500">
                                Loading branches...
                            </td>
                        </tr>
                    )}

                    {!loading && error && (
                        <tr>
                            <td colSpan={columnCount} className="px-5 py-8 text-center text-sm text-red-600">
                                {error}
                            </td>
                        </tr>
                    )}

                    {!loading && !error && branches.length === 0 && (
                        <tr>
                            <td colSpan={columnCount} className="px-5 py-8 text-center text-sm text-slate-500">
                                No branches found.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        !error &&
                        branches.map((branch) => (
                            <tr key={branch.id} className="border-b border-slate-200 align-top hover:bg-blue-100">
                                <td className="px-4 py-3 text-slate-700">{branch.id}</td>
                                <td className="px-4 py-3 text-slate-600">{formatDate(branch.registerDate)}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.registrationNumber}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.branchCode}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.branchName}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.branchNameNep}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.nickName}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.street}, {branch.district}, {branch.zone}/{branch.province} </td>
                                {/* <td className="px-4 py-3 text-slate-600">{branch.district}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.zone}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.province}</td> */}
                                <td className="px-4 py-3 text-slate-600">{branch.country}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.phoneNumber}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.faxNumber}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.cellNumber}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.email}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.panNumber}</td>
                                <td className="px-4 py-3 text-slate-600">{branch.zipCode}</td>
                                <td className="px-4 py-3 text-sky-700">
                                    {branch.url === "-" ? "-" : (
                                        <a
                                            href={branch.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline underline-offset-2"
                                        >
                                            {branch.url}
                                        </a>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600">{formatDate(branch.auditTS)}</td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => onDelete?.(branch.id)}
                                        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

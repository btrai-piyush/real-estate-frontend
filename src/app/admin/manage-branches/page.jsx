'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { branchApi } from "@/api/api";
import { showAdminErrorToast, showAdminSuccessToast } from "@/app/lib/admin-toast";
import { setBranchesList } from "@/app/redux/accounting/accountingSlice";
import BranchTable from "../../ui/admin/manage-branches/branch-table";

function normalizeBranch(raw = {}) {
    return {
        id: raw.id ?? "-",
        registerDate: raw.registerDate ?? null,
        registrationNumber: raw.registrationNumber ?? "-",
        branchCode: raw.branchCode ?? "-",
        branchName: raw.branchName ?? "-",
        branchNameNep: raw.branchNameNep ?? "-",
        nickName: raw.nickName ?? "-",
        street: raw.street ?? "-",
        district: raw.district ?? "-",
        zone: raw.zone ?? "-",
        province: raw.province ?? "-",
        country: raw.country ?? "-",
        phoneNumber: raw.phoneNumber ?? "-",
        faxNumber: raw.faxNumber ?? "-",
        cellNumber: raw.cellNumber ?? "-",
        email: raw.email ?? "-",
        panNumber: raw.panNumber ?? "-",
        zipCode: raw.zipCode ?? "-",
        url: raw.url || "-",
        auditTS: raw.auditTS ?? null,
    };
};

export default function ManageBranches() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBranches = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const payload = await branchApi.getBranches();
            const rows = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload?.items)
                        ? payload.items
                        : [];

            const normalizedBranches = rows.map(normalizeBranch);
            setBranches(normalizedBranches);
            dispatch(setBranchesList(normalizedBranches));
        } catch (err) {
            setError(err?.message || "Failed to load branches.");
            setBranches([]);
            dispatch(setBranchesList([]));
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleDelete = async (branchId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this branch?");
        if (!isConfirmed) {
            return;
        }

        try {
            await branchApi.deleteBranch(branchId);
            showAdminSuccessToast("Branch deleted successfully.");
            await fetchBranches();
            router.push("/admin/manage-branches");
        } catch (err) {
            showAdminErrorToast(err?.message || "Failed to delete branch. Please try again.");
        }
    };

    return (
        <div className="space-y-4 p-2">
            <h1 className="text-2xl font-semibold text-slate-800">Manage Branches</h1>
            <button
                type="button"
                onClick={() => router.push("/admin/manage-branches/create-branch")}
                className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
                Create Branch
            </button>

            <BranchTable branches={branches} loading={loading} error={error} onDelete={handleDelete} />
        </div>
    );
}
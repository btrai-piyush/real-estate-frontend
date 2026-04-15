"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { accountingApi, commonApi } from "@/api/api";
import { useDispatch, useSelector } from "react-redux";
import AccountingSetupShell from "@/app/ui/admin/accounting/setup-shell";
import { Badge, Btn, Field, Input, Select, Toggle } from "@/app/ui/admin/accounting/form-controls";
import {
	deleteGLGroup,
	setGLGroups,
	setGLHeads,
	setMasterGroups,
	selectGLGroups,
	selectGLHeads,
	selectMasterGroups,
} from "@/app/redux/accounting/accountingSlice";

const emptyForm = {
	masterGroupID: "",
	groupCode: "",
	groupName: "",
	groupNepali: "",
	killed: false,
	hidden: false,
};

function validateForm(form) {
	const [nameError, setNameError] = useState("");

	if (!form.groupName.trim()) {
		setNameError("Group name is required.");
	} else {
		setNameError("");
	}
}

export default function GLGroupPage() {
	const dispatch = useDispatch();
	const masterGroups = useSelector(selectMasterGroups);
	const glGroups = useSelector(selectGLGroups);
	const glHeads = useSelector(selectGLHeads);

	const counts = useMemo(
		() => ({
			masterGroups: masterGroups.length,
			glGroups: glGroups.length,
			glHeads: glHeads.length,
		}),
		[masterGroups.length, glGroups.length, glHeads.length]
	);

	const [form, setForm] = useState(emptyForm);
	const [editId, setEditId] = useState(null);
	const [errors, setErrors] = useState({});
	const [filterMasterGroupId, setFilterMasterGroupId] = useState("");
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiError, setApiError] = useState("");

	const isAvailable = async (columnName, value, errorKey) => {
		const tableName = "GlGroup";

		const checkAvailability = await commonApi.checkDuplicate({ tableName, columnName, value });

		if (!value.trim()) {
			setErrors((prev) => ({ ...prev, [errorKey]: "" }));
			return;
		}

		if (checkAvailability.isAvailable === false) {
			setErrors((prev) => ({ ...prev, [errorKey]: checkAvailability.message || "Not available." }));
		} else {
			setErrors((prev) => ({ ...prev, [errorKey]: "" }));
		}
	};

	const loadAccountingData = useCallback(async () => {
		setIsLoadingData(true);
		setApiError("");

		try {
			const [masters, groups, heads] = await Promise.all([
				accountingApi.getMasterGroups(),
				accountingApi.getGLGroups(),
				accountingApi.getGLHeads(),
			]);

			dispatch(setMasterGroups(masters));
			dispatch(setGLGroups(groups));
			dispatch(setGLHeads(heads));
		} catch (error) {
			setApiError(error?.message || "Failed to load accounting data.");
		} finally {
			setIsLoadingData(false);
		}
	}, [dispatch]);

	useEffect(() => {
		loadAccountingData();
	}, [loadAccountingData]);

	const validate = () => {
		const nextErrors = {};

		if (!form.masterGroupID) {
			nextErrors.masterGroupID = "Required";
		}

		if (!form.groupCode.trim()) {
			nextErrors.groupCode = "Required";
		}

		if (!form.groupName.trim()) {
			nextErrors.groupName = "Required";
		}

		return nextErrors;
	};

	const handleSubmit = async () => {
		const nextErrors = validate();
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		const payload = {
			masterGroupID: Number(form.masterGroupID),
			groupCode: form.groupCode.trim(),
			groupName: form.groupName.trim(),
			groupNepali: form.groupNepali.trim(),
			killed: Boolean(form.killed),
			hidden: Boolean(form.hidden),
		};

		setIsSubmitting(true);
		setApiError("");

		try {
			await accountingApi.createGLGroup({ id: editId, ...payload });
			await loadAccountingData();

			setForm(emptyForm);
			setEditId(null);
			setErrors({});
		} catch (error) {
			setApiError(error?.message || "Failed to save GL group.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (group) => {
		setForm({
			masterGroupID: String(group.masterGroupID),
			groupCode: group.groupCode || "",
			groupName: group.groupName || "",
			groupNepali: group.groupNepali || "",
			killed: Boolean(group.killed),
			hidden: Boolean(group.hidden),
		});
		setEditId(group.id);
		setErrors({});
	};

	const handleDelete = (groupId) => {
		dispatch(deleteGLGroup(groupId));

		if (editId === groupId) {
			setForm(emptyForm);
			setEditId(null);
			setErrors({});
		}
	};

	const handleCancel = () => {
		setForm(emptyForm);
		setEditId(null);
		setErrors({});
	};

	const filteredGroups = useMemo(() => {
		if (!filterMasterGroupId) {
			return glGroups;
		}

		return glGroups.filter((group) => Number(group.masterGroupID) === Number(filterMasterGroupId));
	}, [filterMasterGroupId, glGroups]);

	return (
		<AccountingSetupShell
			title="GL Account Setup"
			description="Create GL groups inside each master group and control visibility flags."
			counts={counts}
		>
			<div className="mb-5 sm:mb-6">
				<h2 className="mb-1 text-xl font-bold text-slate-800">GL Groups</h2>
				<p className="text-sm text-slate-600">
					Each GL group belongs to one master group and can later hold multiple GL heads.
				</p>
			</div>

			{apiError && (
				<div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{apiError}
				</div>
			)}

			{isLoadingData && (
				<p className="mb-5 text-sm font-medium text-slate-600">Loading accounting data...</p>
			)}

			{masterGroups.length === 0 && (
				<div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
					No master groups found. Create one first in
					<Link href="/admin/master-group" className="ml-1 font-semibold underline underline-offset-2">
						Master Group
					</Link>
					.
				</div>
			)}

			<div className="mb-8 rounded-xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
				<p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Create or update GL group</p>

				<div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
					<Field label="Master Group" half>
						<Select
							value={form.masterGroupID}
							onChange={(event) => setForm((prev) => ({ ...prev, masterGroupID: event.target.value }))}
							className={errors.masterGroupID ? "border-red-600" : ""}
						>
							<option value="">Select master group</option>
							{masterGroups.map((group) => (
								<option key={group.id} value={group.id}>
									{group.masterGroupName}
								</option>
							))}
						</Select>
						{errors.masterGroupID && <p className="mt-1 text-xs text-red-600">{errors.masterGroupID}</p>}
					</Field>

					<Field label="Group Code" half>
						<Input
							value={form.groupCode}
							onChange={(event) => setForm((prev) => ({ ...prev, groupCode: event.target.value }))}
							placeholder="e.g. GRP001"
							onBlur={(event) => isAvailable("GroupCode", form.groupCode, "groupCode")}
							className={errors.groupCode ? "border-red-600" : ""}
						/>
						{errors.groupCode && <p className="mt-1 text-xs text-red-600">{errors.groupCode}</p>}
					</Field>

					<Field label="Group Name (English)" half>
						<Input
							value={form.groupName}
							onChange={(event) => setForm((prev) => ({ ...prev, groupName: event.target.value }))}
							placeholder="e.g. Cash and Bank"
							onBlur={(event) => isAvailable("GroupName", form.groupName, "groupName")}
							className={errors.groupName ? "border-red-600" : ""}
						/>
						{errors.groupName && <p className="mt-1 text-xs text-red-600">{errors.groupName}</p>}
					</Field>

					<Field label="Group Name (Nepali)" half>
						<Input
							value={form.groupNepali}
							onChange={(event) => setForm((prev) => ({ ...prev, groupNepali: event.target.value }))}
							onBlur={(event) => isAvailable("GroupNameNepali", form.groupNepali, "groupNepali")}
							placeholder="Optional"
							className={errors.groupNepali ? "border-red-600" : ""}
						/>
						{errors.groupNepali && <p className="mt-1 text-xs text-red-600">{errors.groupNepali}</p>}
					</Field>

					<div className="col-span-1 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 md:col-span-2 md:gap-4">
						<Toggle
							checked={form.killed}
							onChange={(value) => setForm((prev) => ({ ...prev, killed: value }))}
							label="Inactive"
						/>
						<Toggle
							checked={form.hidden}
							onChange={(value) => setForm((prev) => ({ ...prev, hidden: value }))}
							label="Hidden"
						/>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					<Btn onClick={handleSubmit} className="w-full sm:w-auto" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : editId ? "Update Group" : "Add GL Group"}
					</Btn>
					{editId && (
						<Btn onClick={handleCancel} variant="secondary" className="w-full sm:w-auto" disabled={isSubmitting}>
							Cancel
						</Btn>
					)}
				</div>
			</div>

			<div className="border-t border-[color:var(--color-border-tertiary)] pt-5">
				<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
					<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
						All GL groups ({filteredGroups.length})
					</p>

					<Select
						value={filterMasterGroupId}
						onChange={(event) => setFilterMasterGroupId(event.target.value)}
						className="h-10 w-full text-sm sm:h-9 sm:w-auto sm:min-w-40 sm:text-xs"
					>
						<option value="">All master groups</option>
						{masterGroups.map((group) => (
							<option key={group.id} value={group.id}>
								{group.masterGroupName}
							</option>
						))}
					</Select>
				</div>

				<div className="flex flex-col gap-2">
					{filteredGroups.map((group) => {
						const masterGroup = masterGroups.find(
							(master) => Number(master.id) === Number(group.masterGroupID)
						);

						return (
							<div
								key={group.id}
								className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
							>
								<div>
									<div className="mb-1 flex flex-wrap items-center gap-2">
										<p className="text-sm font-semibold text-slate-800">{group.groupName}</p>
										<p className="font-mono text-xs font-medium text-slate-600">{group.groupCode}</p>
										{group.killed && <Badge color="red">Inactive</Badge>}
										{group.hidden && <Badge color="gray">Hidden</Badge>}
									</div>

									<div className="flex items-center gap-2">
										<span className="text-xs text-slate-600">under</span>
										<Badge color="blue">{masterGroup?.masterGroupName || "Unknown"}</Badge>
										{group.groupNepali && (
											<span className="text-xs text-slate-600">{group.groupNepali}</span>
										)}
									</div>
								</div>

								<div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-1.5">
									<Btn onClick={() => handleEdit(group)} variant="secondary" small className="w-full sm:w-auto">
										Edit
									</Btn>
									<Btn onClick={() => handleDelete(group.id)} variant="danger" small className="w-full sm:w-auto">
										Delete
									</Btn>
								</div>
							</div>
						);
					})}

					{filteredGroups.length === 0 && (
						<p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-600">
							No GL groups found.
						</p>
					)}
				</div>
			</div>
		</AccountingSetupShell>
	);
}

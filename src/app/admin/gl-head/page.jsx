"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { accountingApi, branchApi, commonApi } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import AccountingSetupShell from "@/app/ui/admin/accounting/setup-shell";
import { Badge, Btn, Field, Input, Select, Toggle } from "@/app/ui/admin/accounting/form-controls";
import {
	deleteGLHead,
	setGLGroups,
	setGLHeads,
	setMasterGroups,
	selectBranches,
	selectGLGroups,
	selectGLHeads,
	selectMasterGroups,
	setBranchesList,
} from "@/app/redux/accounting/accountingSlice";

const emptyForm = {
	branchID: "",
	masterGroupID: "",
	groupID: "",
	glName: "",
	glNameNepali: "",
	openingBal: "",
	openingShareAmount: "",
	openingShareQty: "",
	killed: false,
	hidden: false,
	locked: false,
	isSys: false,
	isShare: false,
	isBank: false,
	address: "",
	contact: "",
	sex: "",
	shareHolder: "",
};

function normalizeBranch(raw = {}) {
	const id = raw.id ?? raw.branchId ?? raw.ID;
	const name = raw.branchName ?? raw.name ?? raw.branchCode;

	if (id === undefined || id === null) {
		return null;
	}

	return {
		id,
		name: name || `Branch ${id}`,
	};
}

function SectionTitle({ children }) {
	return (
		<div className="col-span-1 mb-1 mt-2 border-b border-[color:var(--color-border-tertiary)] pb-1 pt-2 md:col-span-2">
			<span className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400">
				{children}
			</span>
		</div>
	);
}

export default function GLHeadPage() {
	const dispatch = useDispatch();
	const { user } = useAuth();
	const masterGroups = useSelector(selectMasterGroups);
	const glGroups = useSelector(selectGLGroups);
	const glHeads = useSelector(selectGLHeads);
	const branches = useSelector(selectBranches);
	const auditUserID = useMemo(() => {
		const currentUserId =
			user?.userId ?? user?.userID ?? user?.id ?? user?.ID ?? user?.nameIdentifier;

		return currentUserId ? String(currentUserId) : "";
	}, [user]);

	const counts = useMemo(
		() => ({
			masterGroups: masterGroups.length,
			glGroups: glGroups.length,
			glHeads: glHeads.length,
		}),
		[masterGroups.length, glGroups.length, glHeads.length]
	);

	const isAvailable = async (columnName, value, errorKey) => {
		const tableName = "GlHead";

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

	const [isLoadingBranches, setIsLoadingBranches] = useState(true);
	const [isLoadingAccounting, setIsLoadingAccounting] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [branchError, setBranchError] = useState("");
	const [apiError, setApiError] = useState("");

	const [form, setForm] = useState(emptyForm);
	const [editId, setEditId] = useState(null);
	const [errors, setErrors] = useState({});

	const loadAccountingData = useCallback(async () => {
		setIsLoadingAccounting(true);
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
			setIsLoadingAccounting(false);
		}
	}, [dispatch]);

	const loadBranches = useCallback(async () => {
		setIsLoadingBranches(true);
		setBranchError("");

		try {
			const payload = await branchApi.getBranches();
			const rows = Array.isArray(payload)
				? payload
				: Array.isArray(payload?.data)
					? payload.data
					: Array.isArray(payload?.items)
						? payload.items
						: [];

			const normalized = rows.map(normalizeBranch).filter(Boolean);
			dispatch(setBranchesList(normalized));
		} catch (error) {
			dispatch(setBranchesList([]));
			setBranchError(error?.message || "Failed to load branches.");
		} finally {
			setIsLoadingBranches(false);
		}
	}, [dispatch]);

	useEffect(() => {
		loadBranches();
	}, [loadBranches]);

	useEffect(() => {
		loadAccountingData();
	}, [loadAccountingData]);

	useEffect(() => {
		if (!form.masterGroupID) {
			return;
		}

		const isValidGroup = glGroups.some(
			(group) =>
				Number(group.id) === Number(form.groupID) &&
				Number(group.masterGroupID) === Number(form.masterGroupID)
		);

		if (!isValidGroup && form.groupID) {
			setForm((prev) => ({ ...prev, groupID: "" }));
		}
	}, [form.groupID, form.masterGroupID, glGroups]);

	const filteredGroups = useMemo(() => {
		if (!form.masterGroupID) {
			return glGroups;
		}

		return glGroups.filter(
			(group) => Number(group.masterGroupID) === Number(form.masterGroupID)
		);
	}, [form.masterGroupID, glGroups]);

	const validate = () => {
		const nextErrors = {};

		if (!form.branchID) {
			nextErrors.branchID = "Required";
		}

		if (!form.groupID) {
			nextErrors.groupID = "Required";
		}

		if (!form.glName.trim()) {
			nextErrors.glName = "Required";
		}

		return nextErrors;
	};

	const handleSubmit = async () => {
		const nextErrors = validate();
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (!auditUserID) {
			setApiError("Unable to determine current user ID for audit.");
			return;
		}

		const selectedGroup = glGroups.find((group) => Number(group.id) === Number(form.groupID));

		const entry = {
			branchID: Number(form.branchID),
			groupID: Number(form.groupID),
			masterGroupID: Number(form.masterGroupID || selectedGroup?.masterGroupID || 0),
			glName: form.glName.trim(),
			glNameNepali: form.glNameNepali.trim(),
			openingBal: Number(form.openingBal) || 0,
			openingShareAmount: Number(form.openingShareAmount) || 0,
			openingShareQty: Number(form.openingShareQty) || 0,
			killed: Boolean(form.killed),
			hidden: Boolean(form.hidden),
			locked: Boolean(form.locked),
			isSys: Boolean(form.isSys),
			isShare: Boolean(form.isShare),
			isBank: Boolean(form.isBank),
			address: form.address.trim(),
			contact: form.contact.trim(),
			sex: form.sex,
			shareHolder: form.shareHolder.trim(),
			auditUserID,
		};

		setIsSubmitting(true);
		setApiError("");

		try {
			await accountingApi.createGLHead(entry);
			await loadAccountingData();

			setForm(emptyForm);
			setEditId(null);
			setErrors({});
		} catch (error) {
			setApiError(error?.message || "Failed to save GL head.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (head) => {
		const group = glGroups.find((item) => Number(item.id) === Number(head.groupID));

		setForm({
			branchID: String(head.branchID || ""),
			masterGroupID: String(group?.masterGroupID || head.masterGroupID || ""),
			groupID: String(head.groupID || ""),
			glName: head.glName || "",
			glNameNepali: head.glNameNepali || "",
			openingBal: String(head.openingBal ?? ""),
			openingShareAmount: String(head.openingShareAmount ?? ""),
			openingShareQty: String(head.openingShareQty ?? ""),
			killed: Boolean(head.killed),
			hidden: Boolean(head.hidden),
			locked: Boolean(head.locked),
			isSys: Boolean(head.isSys),
			isShare: Boolean(head.isShare),
			isBank: Boolean(head.isBank),
			address: head.address || "",
			contact: head.contact || "",
			sex: String(head.sex ?? ""),
			shareHolder: head.shareHolder || "",
		});

		setEditId(head.id);
		setErrors({});
	};

	const handleDelete = (headId) => {
		dispatch(deleteGLHead(headId));

		if (editId === headId) {
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

	const setField = (key) => (event) => {
		setForm((prev) => ({ ...prev, [key]: event.target.value }));
	};

	const setToggle = (key) => (value) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<AccountingSetupShell
			title="GL Account Setup"
			description="Create ledger heads inside GL groups and attach them to active branches."
			counts={counts}
		>
			<div className="mb-5 sm:mb-6">
				<h2 className="mb-1 text-xl font-bold text-slate-800">GL Heads</h2>
				<p className="text-sm text-slate-600">
					Select branch and group, then configure account flags and optional share or bank details.
				</p>
			</div>

			{apiError && (
				<div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{apiError}
				</div>
			)}

			{isLoadingAccounting && (
				<p className="mb-5 text-sm font-medium text-slate-600">Loading accounting data...</p>
			)}

			{glGroups.length === 0 && (
				<div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
					No GL groups found. Create one first in
					<Link href="/admin/gl-group" className="ml-1 font-semibold underline underline-offset-2">
						GL Group
					</Link>
					.
				</div>
			)}

			{!isLoadingBranches && branchError && (
				<div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{branchError}
				</div>
			)}

			{!isLoadingBranches && !branchError && branches.length === 0 && (
				<div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
					No branches found. Create one first in
					<Link href="/admin/manage-branches/create-branch" className="ml-1 font-semibold underline underline-offset-2">
						Branch Registration
					</Link>
					.
				</div>
			)}

			<div className="mb-8 rounded-xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
				<p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Create or update GL head</p>

				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					<SectionTitle>Account location</SectionTitle>

					<Field label="Branch" half>
						<Select
							value={form.branchID}
							onChange={setField("branchID")}
							className={errors.branchID ? "border-red-600" : ""}
						>
							<option value="">Select branch</option>
							{branches.map((branch) => (
								<option key={branch.id} value={branch.id}>
									{branch.name}
								</option>
							))}
						</Select>
						{errors.branchID && <p className="mt-1 text-xs text-red-600">{errors.branchID}</p>}
					</Field>

					<div className="hidden md:block" />

					<Field label="Master Group" half>
						<Select value={form.masterGroupID} onChange={setField("masterGroupID")}>
							<option value="">All master groups</option>
							{masterGroups.map((group) => (
								<option key={group.id} value={group.id}>
									{group.masterGroupName}
								</option>
							))}
						</Select>
						<p className="mt-1 text-xs text-slate-600">
							Use this to filter the GL group list.
						</p>
					</Field>

					<Field label="GL Group" half>
						<Select
							value={form.groupID}
							onChange={setField("groupID")}
							className={errors.groupID ? "border-red-600" : ""}
						>
							<option value="">Select GL group</option>
							{filteredGroups.map((group) => (
								<option key={group.id} value={group.id}>
									{group.groupName}
								</option>
							))}
						</Select>
						{errors.groupID && <p className="mt-1 text-xs text-red-600">{errors.groupID}</p>}
					</Field>

					<SectionTitle>Basic info</SectionTitle>

					<Field label="GL Name (English)" half>
					<Input
						value={form.glName}
						onChange={setField("glName")}
						placeholder="e.g. Cash in Hand"
						onBlur={(event) => isAvailable("GLName", form.glName,"glName")}
						className={errors.glName ? "border-red-600" : ""}
					/>
					{errors.glName && <p className="mt-1 text-xs text-red-600">{errors.glName}</p>}
					</Field>

					<Field label="GL Name (Nepali)" half>
					<Input
						value={form.glNameNepali}
						onChange={setField("glNameNepali")}
						placeholder="Optional"
						onBlur={(event) => isAvailable("GLNameNepali", form.glNameNepali,"glNameNepali")}
						className={errors.glNameNepali ? "border-red-600" : ""}
					/>
					{errors.glNameNepali && <p className="mt-1 text-xs text-red-600">{errors.glNameNepali}</p>}
					</Field>

					<Field label="Opening Balance" half>
					<Input type="number" value={form.openingBal} onChange={setField("openingBal")} placeholder="0" />
					</Field>

					<SectionTitle>Flags</SectionTitle>

					<div className="col-span-1 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 sm:grid-cols-2 lg:grid-cols-3 md:col-span-2">
					<Toggle checked={form.isShare} onChange={setToggle("isShare")} label="Share Account" />
					<Toggle checked={form.isBank} onChange={setToggle("isBank")} label="Bank Account" />
					<Toggle checked={form.isSys} onChange={setToggle("isSys")} label="System Account" />
					<Toggle checked={form.locked} onChange={setToggle("locked")} label="Locked" />
					<Toggle checked={form.hidden} onChange={setToggle("hidden")} label="Hidden" />
					<Toggle checked={form.killed} onChange={setToggle("killed")} label="Inactive" />
					</div>

					{form.isShare && (
					<>
						<SectionTitle>Share details</SectionTitle>

						<Field label="Opening Share Amount" half>
							<Input
								type="number"
								value={form.openingShareAmount}
								onChange={setField("openingShareAmount")}
								placeholder="0"
							/>
						</Field>

						<Field label="Opening Share Qty" half>
							<Input
								type="number"
								value={form.openingShareQty}
								onChange={setField("openingShareQty")}
								placeholder="0"
							/>
						</Field>

						<Field label="Shareholder Name" half>
							<Input value={form.shareHolder} onChange={setField("shareHolder")} placeholder="Name" />
						</Field>

						<Field label="Sex" half>
							<Select value={form.sex} onChange={setField("sex")}>
								<option value="">Select</option>
								<option value="1">Male</option>
								<option value="2">Female</option>
								<option value="3">Other</option>
							</Select>
						</Field>
					</>
					)}

					{form.isBank && (
					<>
						<SectionTitle>Bank details</SectionTitle>

						<Field label="Bank Address" half>
							<Input value={form.address} onChange={setField("address")} placeholder="Address" />
						</Field>

						<Field label="Contact Number" half>
							<Input value={form.contact} onChange={setField("contact")} placeholder="Phone" />
						</Field>
					</>
					)}
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					<Btn onClick={handleSubmit} className="w-full sm:w-auto" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : editId ? "Update GL Head" : "Add GL Head"}
					</Btn>
					{editId && (
						<Btn onClick={handleCancel} variant="secondary" className="w-full sm:w-auto" disabled={isSubmitting}>
							Cancel
						</Btn>
					)}
				</div>
			</div>

			<div className="border-t border-[color:var(--color-border-tertiary)] pt-5">
				<p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
					All GL heads ({glHeads.length})
				</p>

				<div className="flex flex-col gap-2">
					{glHeads.map((head) => {
						const group = glGroups.find((item) => Number(item.id) === Number(head.groupID));
						const masterGroup = masterGroups.find(
							(item) => Number(item.id) === Number(group?.masterGroupID || head.masterGroupID)
						);
						const branch = branches.find((item) => Number(item.id) === Number(head.branchID));

						return (
							<div
								key={head.id}
								className="rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:border-slate-300 hover:shadow-sm"
							>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<div className="mb-1 flex flex-wrap items-center gap-2">
											<p className="text-sm font-semibold text-slate-800">{head.glName}</p>
											{head.glNameNepali && (
												<p className="text-xs text-slate-600">{head.glNameNepali}</p>
											)}
										</div>

										<div className="mb-2 flex flex-wrap items-center gap-1.5">
											{branch && <Badge color="gray">{branch.name}</Badge>}
											{masterGroup && <Badge color="blue">{masterGroup.masterGroupName}</Badge>}
											{group && <Badge color="green">{group.groupName}</Badge>}
											{head.isShare && <Badge color="blue">Share</Badge>}
											{head.isBank && <Badge color="blue">Bank</Badge>}
											{head.isSys && <Badge color="gray">System</Badge>}
											{head.killed && <Badge color="red">Inactive</Badge>}
											{head.locked && <Badge color="red">Locked</Badge>}
										</div>

										<p className="text-xs font-medium text-slate-600">
											Opening Balance: {Number(head.openingBal || 0).toLocaleString()}
											{head.isShare && ` | Share Qty: ${head.openingShareQty || 0}`}
										</p>
									</div>

									<div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-1.5">
										<Btn onClick={() => handleEdit(head)} variant="secondary" small className="w-full sm:w-auto">
											Edit
										</Btn>
										<Btn onClick={() => handleDelete(head.id)} variant="danger" small className="w-full sm:w-auto">
											Delete
										</Btn>
									</div>
								</div>
							</div>
						);
					})}

					{glHeads.length === 0 && (
						<p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-600">
							No GL heads added yet.
						</p>
					)}
				</div>
			</div>
		</AccountingSetupShell>
	);
}

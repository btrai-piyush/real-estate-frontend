'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PropertyForm from "@/app/ui/admin/property-form";
import { propertyApi } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { nunito } from "@/app/ui/fonts";
import { showAdminErrorToast, showAdminSuccessToast } from "@/app/lib/admin-toast";

const IMAGE_BASE_URL = "https://localhost:7018/api/uploads/property_images";

const buildCoverImageUrl = (coverPhoto) => {
	if (!coverPhoto || coverPhoto === "no-image-available") {
		return null;
	}

	if (coverPhoto.startsWith("http://") || coverPhoto.startsWith("https://")) {
		return coverPhoto;
	}

	return `${IMAGE_BASE_URL}/${coverPhoto}`;
};

const toBoolean = (value) => {
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value === 1;
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		return normalized === "true" || normalized === "1" || normalized === "active";
	}
	return false;
};

const unwrapProperty = (response) => {
	if (Array.isArray(response)) {
		return response[0] || null;
	}

	return response?.data || response?.result || response?.item || response || null;
};

export default function EditPropertyPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user } = useAuth();

	const propertyId = searchParams.get("id");

	const [loadingProperty, setLoadingProperty] = useState(true);
	const [title, setTitle] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [stateProvince, setStateProvince] = useState("");
	const [price, setPrice] = useState("");
	const [pricePeriod, setPricePeriod] = useState("Per Month");
	const [description, setDescription] = useState("");
	const [area, setArea] = useState("");
	const [condition, setCondition] = useState("Excellent");
	const [furnishing, setFurnishing] = useState("Unfurnished");
	const [isFeatured, setIsFeatured] = useState(false);
	const [listingStatus, setListingStatus] = useState(true);

	const [type, setType] = useState("");
	const [saleOption, setSaleOption] = useState("");
	const [addedBy, setAddedBy] = useState("");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	const [amenities, setAmenities] = useState([]);
	const [coverImage, setCoverImage] = useState(null);
	const [images, setImages] = useState([]);
	const [coverDragging, setCoverDragging] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [beds, setBeds] = useState(1);
	const [baths, setBaths] = useState(1);
	const [parking, setParking] = useState(0);
	const [done, setDone] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");

	const fileRef = useRef();
	const coverFileRef = useRef();

	const parsedLatitude = Number.parseFloat(latitude);
	const parsedLongitude = Number.parseFloat(longitude);
	const hasValidCoordinates =
		Number.isFinite(parsedLatitude) &&
		Number.isFinite(parsedLongitude) &&
		parsedLatitude >= -90 &&
		parsedLatitude <= 90 &&
		parsedLongitude >= -180 &&
		parsedLongitude <= 180;

	const selectedMapPosition = useMemo(() => {
		if (!hasValidCoordinates) {
			return null;
		}
		return { lat: parsedLatitude, lng: parsedLongitude };
	}, [hasValidCoordinates, parsedLatitude, parsedLongitude]);

	useEffect(() => {
		let mounted = true;

		const loadProperty = async () => {
			if (!propertyId) {
				const message = "Missing property ID in URL.";
				setSubmitError(message);
				showAdminErrorToast(message);
				setLoadingProperty(false);
				return;
			}

			setLoadingProperty(true);
			setSubmitError("");

			try {
				const response = await propertyApi.getById(propertyId);
				const property = unwrapProperty(response);

				if (!mounted || !property) {
					return;
				}

				const directPrice = Number(property?.price) || 0;
				const coverUrl = buildCoverImageUrl(property?.coverPhoto);

				setTitle(property?.title || "");
				setAddress(property?.address || "");
				setCity(property?.city || "");
				setStateProvince(property?.state || "");
				setPrice(String(directPrice || ""));
				setPricePeriod("Per Month");
				setDescription(property?.description || "");
				setArea(property?.area != null ? String(property.area) : "");
				setCondition(property?.condition || "Excellent");
				setFurnishing(property?.furnishing || "Unfurnished");
				setIsFeatured(toBoolean(property?.isFeatured));
				setListingStatus(toBoolean(property?.listingStatus));

				setType(property?.type || "");
				setSaleOption(property?.saleOption || "");
				setAddedBy(property?.addedBy || "");
				setLatitude(property?.latitude != null ? String(property.latitude) : "");
				setLongitude(property?.longitude != null ? String(property.longitude) : "");
				setAmenities(Array.isArray(property?.amenities) ? property.amenities : []);
				setBeds(Number(property?.beds) || 1);
				setBaths(Number(property?.baths) || 1);
				setParking(Number(property?.parking) || 0);

				if (coverUrl) {
					setCoverImage({
						name: property?.coverPhoto || "Current cover",
						url: coverUrl,
						file: null,
					});
				} else {
					setCoverImage(null);
				}

				setImages([]);
			} catch (error) {
				if (mounted) {
					const message = error?.message || "Failed to load property details.";
					setSubmitError(message);
					showAdminErrorToast(message);
				}
			} finally {
				if (mounted) {
					setLoadingProperty(false);
				}
			}
		};

		loadProperty();

		return () => {
			mounted = false;
		};
	}, [propertyId]);

	const toggleAmenity = (a) =>
		setAmenities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));

	const removeImageAt = (targetIndex) => {
		setImages((previous) => {
			const next = previous.filter((_, index) => index !== targetIndex);
			const removed = previous[targetIndex];
			if (removed?.url?.startsWith("blob:")) {
				URL.revokeObjectURL(removed.url);
			}
			return next;
		});
	};

	const addCoverImage = (files) => {
		const [file] = Array.from(files || []);
		if (!file) {
			return;
		}

		setCoverImage((previous) => {
			if (previous?.url?.startsWith("blob:")) {
				URL.revokeObjectURL(previous.url);
			}

			return {
				file,
				name: file.name,
				url: URL.createObjectURL(file),
			};
		});
	};

	const removeCoverImage = () => {
		setCoverImage((previous) => {
			if (previous?.url?.startsWith("blob:")) {
				URL.revokeObjectURL(previous.url);
			}
			return null;
		});
	};

	const addImages = (files) => {
		const incoming = Array.from(files || []);
		if (!incoming.length) {
			return;
		}

		const mapped = incoming.map((file) => ({
			file,
			name: file.name,
			url: URL.createObjectURL(file),
		}));

		setImages((p) => [...p, ...mapped]);
	};

	const onDrop = (e) => {
		e.preventDefault();
		setDragging(false);
		addImages(e.dataTransfer.files);
	};

	const onCoverDrop = (e) => {
		e.preventDefault();
		setCoverDragging(false);
		addCoverImage(e.dataTransfer.files);
	};

	const handleMapLocationSelect = ({ lat, lng }) => {
		setLatitude(lat.toFixed(6));
		setLongitude(lng.toFixed(6));
	};

	const numericPrice = Number.parseFloat(price);
	const hasValidPrice = Number.isFinite(numericPrice) && numericPrice > 0;
	const numericArea = Number.parseInt(area, 10);
	const canSubmit =
		title.trim() &&
		type &&
		saleOption &&
		address.trim() &&
		city.trim() &&
		hasValidPrice &&
		coverImage;

	const handleUpdateProperty = async () => {
		setSubmitError("");

		if (!propertyId) {
			const message = "Missing property ID in URL.";
			setSubmitError(message);
			showAdminErrorToast(message);
			return;
		}

		if (!canSubmit) {
			const message = "Please fill the required fields and keep/upload a cover image.";
			setSubmitError(message);
			showAdminErrorToast(message);
			return;
		}

		const combinedName = [user?.firstName, user?.lastName]
			.filter(Boolean)
			.join(" ")
			.trim();

		const editorName =
			user?.fullName ||
			user?.name ||
			combinedName ||
			user?.username ||
			user?.email ||
			"system";

		// Send a file only when changed. Otherwise, API layer sends CoverPhoto as null marker.
		const coverPhotoPayload = coverImage?.file instanceof File ? coverImage.file : null;

		const payload = {
			ID: Number(propertyId) || propertyId,
			Title: title.trim(),
			Price: numericPrice,
			Area: Number.isFinite(numericArea) ? numericArea : 0,
			City: city.trim(),
			SaleOption: saleOption,
			IsFeatured: Boolean(isFeatured),
			Type: type,
			AddedBy: addedBy || editorName,
			ListingStatus: Boolean(listingStatus),
			State: stateProvince.trim(),
			CoverPhoto: coverPhotoPayload,
			Address: address.trim(),
			Latitude: hasValidCoordinates ? parsedLatitude : 0,
			Longitude: hasValidCoordinates ? parsedLongitude : 0,
			UpdatedBy: editorName,
		};

		setSubmitting(true);

		try {
			await propertyApi.updateProperty(propertyId, payload);

			for (const image of images) {
				if (!image?.file) {
					continue;
				}

				await propertyApi.uploadPropertyImage({
					file: image.file,
					propertyId,
					propertyName: payload.Title,
					propertyCity: payload.City,
				});
			}

			showAdminSuccessToast("Property updated successfully.");
			setDone(true);
		} catch (error) {
			const message = error?.message || "Failed to update property. Please try again.";
			setSubmitError(message);
			showAdminErrorToast(message);
		} finally {
			setSubmitting(false);
		}
	};

	if (loadingProperty) {
		return (
			<div className={`${nunito.className} flex min-h-screen items-center justify-center bg-slate-50 px-6`}>
				<p className="text-sm text-slate-500">Loading property details...</p>
			</div>
		);
	}

	if (done) {
		return (
			<div className={`${nunito.className} flex min-h-screen items-center justify-center bg-slate-50 px-6`}>
				<div className="w-full max-w-[460px] text-center">
					<div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-emerald-500 shadow-[0_12px_32px_rgba(16,185,129,0.25)]">
						<svg width={34} height={34} fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
					</div>
					<h2 className="mb-3 text-3xl font-bold text-slate-800">Property Updated!</h2>
					<p className="mb-8 text-[15px] text-slate-400">Your listing changes were saved successfully.</p>
					<div className="flex justify-center gap-3">
						<button
							type="button"
							onClick={() => router.push("/admin/my-properties")}
							className="rounded-xl bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
						>
							Back to Properties
						</button>
						<button
							type="button"
							onClick={() => setDone(false)}
							className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
						>
							Continue Editing
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`${nunito.className} min-h-screen bg-slate-50 text-slate-800`}>
			<div className="border-b border-slate-100 bg-white">
				<div className="mx-auto max-w-[1200px] px-6 py-6">
					<h1 className="mb-1 text-3xl font-bold">Edit Property</h1>
					<p className="text-sm text-slate-500">Update your listing details and save the latest information.</p>
				</div>
			</div>

			<div className="mx-auto max-w-[1400px] px-6 pb-20 pt-7">
				<PropertyForm
					values={{
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
					}}
					actions={{
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
					}}
					selectedMapPosition={selectedMapPosition}
					onLocationSelect={handleMapLocationSelect}
					canSubmit={canSubmit}
					submitting={submitting}
					submitError={submitError}
					onSubmit={handleUpdateProperty}
					submitLabel="Update Property"
					submittingLabel="Saving..."
					fileRef={fileRef}
					coverFileRef={coverFileRef}
				/>
			</div>
		</div>
	);
}

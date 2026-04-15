'use client';

import { useRef, useState } from "react";
import PropertyForm from "@/app/ui/admin/property-form";
import { propertyApi } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { nunito } from "@/app/ui/fonts";
import { showAdminErrorToast, showAdminSuccessToast } from "@/app/lib/admin-toast";

export default function AddNewProperty() {
  const { user } = useAuth();

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

  const selectedMapPosition = hasValidCoordinates
    ? { lat: parsedLatitude, lng: parsedLongitude }
    : null;

  const toggleAmenity = (a) =>
    setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const removeImageAt = (targetIndex) => {
    setImages(previous => {
      const next = previous.filter((_, index) => index !== targetIndex);
      const removed = previous[targetIndex];
      if (removed?.url) {
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
      if (previous?.url) {
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
      if (previous?.url) {
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

    const mapped = incoming.map(file => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setImages(p => [...p, ...mapped]);
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

  const resetFormState = () => {
    setTitle("");
    setAddress("");
    setCity("");
    setStateProvince("");
    setPrice("");
    setPricePeriod("Per Month");
    setDescription("");
    setArea("");
    setCondition("Excellent");
    setFurnishing("Unfurnished");
    setIsFeatured(false);
    setListingStatus(true);

    if (coverImage?.url) {
      URL.revokeObjectURL(coverImage.url);
    }
    setCoverImage(null);
    setCoverDragging(false);

    setImages(previous => {
      previous.forEach(image => {
        if (image?.url) {
          URL.revokeObjectURL(image.url);
        }
      });
      return [];
    });

    setAmenities([]);
    setType("");
    setSaleOption("");
    setLatitude("");
    setLongitude("");
    setBeds(1);
    setBaths(1);
    setParking(0);
    setSubmitError("");
  };

  const handleCreateProperty = async () => {
    setSubmitError("");

    if (!canSubmit) {
      const message = "Please fill the required fields and upload a cover photo.";
      setSubmitError(message);
      showAdminErrorToast(message);
      return;
    }

    const combinedName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const createdBy =
      user?.fullName ||
      user?.name ||
      combinedName ||
      user?.username ||
      user?.email ||
      "system";

    const payload = {
      ID: 0,
      Title: title.trim(),
      Price: numericPrice,
      Area: Number.isFinite(numericArea) ? numericArea : 0,
      City: city.trim(),
      SaleOption: saleOption,
      IsFeatured: Boolean(isFeatured),
      Type: type,
      AddedBy: createdBy,
      ListingStatus: Boolean(listingStatus),
      State: stateProvince.trim(),
      CoverPhoto: coverImage?.file || null,
      Address: address.trim(),
      Latitude: hasValidCoordinates ? parsedLatitude : 0,
      Longitude: hasValidCoordinates ? parsedLongitude : 0,
      UpdatedBy: createdBy,
    };

    setSubmitting(true);

    try {
      const created = await propertyApi.addProperty(payload);
      const propertyId =
        created?.PropertyID ??
        created?.propertyID ??
        created?.propertyId ??
        created?.ID ??
        created?.id;

      if (images.length && !propertyId) {
        throw new Error("Property created, but PropertyId was not returned for image uploads.");
      }

      if (propertyId) {
        for (const image of images) {
          await propertyApi.uploadPropertyImage({
            file: image.file,
            propertyId,
            propertyName: payload.Title,
            propertyCity: payload.City,
          });
        }
      }

      showAdminSuccessToast("Property listed successfully.");
      setDone(true);
    } catch (error) {
      const message = error?.message || "Failed to create property. Please try again.";
      setSubmitError(message);
      showAdminErrorToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={`${nunito.className} flex min-h-screen items-center justify-center bg-slate-50 px-6`}>
        <div className="w-full max-w-[420px] text-center">
          <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-indigo-500 shadow-[0_12px_32px_rgba(99,102,241,0.25)]">
            <svg width={34} height={34} fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="mb-3 text-3xl font-bold text-slate-800">Property Listed!</h2>
          <p className="mb-8 text-[15px] text-slate-400">Your listing has been submitted and is under review. You&apos;ll be notified once it goes live.</p>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              resetFormState();
            }}
            className="rounded-xl bg-indigo-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Add Another Property
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${nunito.className} min-h-screen bg-slate-50 text-slate-800`}>
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-6">
          <h1 className="mb-1 text-3xl font-bold">Add New Property</h1>
          <p className="text-sm text-slate-500">Fill in listing information, media, and amenities to publish your property.</p>
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
          onSubmit={handleCreateProperty}
          fileRef={fileRef}
          coverFileRef={coverFileRef}
        />
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { Compass, Mail, MapPin, PhoneCall } from "lucide-react";
import { contactApi } from "@/api/api";

const DEFAULT_OFFICE_CONTACT = {
    id: 1,
    address: "Satdobato, Lalitpur",
    email: "example@email.com",
    phone1: "9834314312",
    phone2: "51237128",
    latitude: 27.659965,
    longitude: 85.326184,
};

const toSafeText = (value, fallback = "") => {
    if (value === undefined || value === null) return fallback;
    const text = String(value).trim();
    return text || fallback;
};

export default function ContactUs() {
    const [officeContact, setOfficeContact] = useState(DEFAULT_OFFICE_CONTACT);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadOfficeContact = async () => {
            try {
                const response = await contactApi.getOfficeContact();

                if (!isMounted || !response || typeof response !== "object") {
                    return;
                }

                setOfficeContact({
                    ...DEFAULT_OFFICE_CONTACT,
                    ...response,
                });
            } catch (error) {
                if (!isMounted) return;
                setLoadError("Unable to load office contact details.");
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadOfficeContact();

        return () => {
            isMounted = false;
        };
    }, []);

    const phoneNumbers = useMemo(
        () => [officeContact.phone1, officeContact.phone2].map((value) => toSafeText(value)).filter(Boolean),
        [officeContact.phone1, officeContact.phone2],
    );

    const mapLink = useMemo(() => {
        const latitude = Number(officeContact.latitude);
        const longitude = Number(officeContact.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return "";
        }

        return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }, [officeContact.latitude, officeContact.longitude]);

    return (
        <aside className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)] md:p-7">
            <h3 className="text-[32px] font-bold tracking-tight text-slate-900">Contact Us</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                Reach us anytime for listing support, office inquiries, or partnership opportunities.
            </p>

            {loadError && <p className="mt-3 text-sm font-medium text-rose-600">{loadError}</p>}

            {isLoading ? (
                <div className="mt-8 text-sm font-medium text-slate-500">Loading office contact...</div>
            ) : (
                <div className="mt-8 space-y-7">
                    <div className="flex gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-[#eb6666]" />
                        <div>
                            <p className="text-lg font-semibold text-slate-900">Address</p>
                            <p className="mt-1 whitespace-pre-line text-slate-600">{toSafeText(officeContact.address, "Address unavailable")}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <PhoneCall className="mt-0.5 h-5 w-5 text-[#eb6666]" />
                        <div>
                            <p className="text-lg font-semibold text-slate-900">Phone</p>
                            <div className="mt-1 space-y-1">
                                {phoneNumbers.length ? (
                                    phoneNumbers.map((phone) => (
                                        <a
                                            key={phone}
                                            href={`tel:${phone}`}
                                            className="block text-slate-600 transition hover:text-[#eb6666]"
                                        >
                                            {phone}
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-slate-600">Phone number unavailable</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Mail className="mt-0.5 h-5 w-5 text-[#eb6666]" />
                        <div>
                            <p className="text-lg font-semibold text-slate-900">Mail</p>
                            <a
                                href={`mailto:${toSafeText(officeContact.email, DEFAULT_OFFICE_CONTACT.email)}`}
                                className="mt-1 block text-slate-600 transition hover:text-[#eb6666]"
                            >
                                {toSafeText(officeContact.email, DEFAULT_OFFICE_CONTACT.email)}
                            </a>
                        </div>
                    </div>

                    {mapLink && (
                        <div className="flex gap-3">
                            <Compass className="mt-0.5 h-5 w-5 text-[#eb6666]" />
                            <div>
                                <p className="text-lg font-semibold text-slate-900">Location</p>
                                <a
                                    href={mapLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 inline-block text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-[#eb6666]"
                                >
                                    Get direction on map
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
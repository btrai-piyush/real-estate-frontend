'use client';

import Image from 'next/image';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { ChevronDown, MapPin } from "lucide-react";
import { nunito } from "@/app/ui/fonts";

const PROPERTY_TYPE_OPTIONS = ["", "House", "Apartment", "Condo", "Villa", "Land", "Commercial"];
const PRICE_RANGE_OPTIONS = [
	"",
	"Under Rs.100,000",
	"Rs.100,000 – Rs.250,000",
	"Rs.250,000 – Rs.500,000",
	"Rs.500,000 – Rs.1,000,000",
	"Over Rs.1,000,000",
];

export default function Hero() {
	const router = useRouter();
	const [mode, setMode] = useState("Buy");
	const [keyword, setKeyword] = useState("");
	const [propertyType, setPropertyType] = useState("");
	const [location, setLocation] = useState("");
	const [priceRange, setPriceRange] = useState("");

	const handleSearch = () => {
		const params = new URLSearchParams();

		const normalizedKeyword = keyword.trim();
		const normalizedLocation = location.trim();

		if (normalizedKeyword) params.set("keyword", normalizedKeyword);
		if (normalizedLocation) params.set("location", normalizedLocation);
		if (propertyType) params.set("propertyType", propertyType);
		if (priceRange) params.set("priceRange", priceRange);
		params.set("saleOption", mode === "Rent" ? "For Rent" : "For Sale");

		router.push(`/home/listing?${params.toString()}`);
	};

	return (
		<section className={`${nunito.className} relative w-full px-2 pb-8 sm:px-3 sm:pb-10 xl:pb-24`}>
			<div className="relative isolate h-[670px] sm:h-[670px] xl:h-[600px]">
				<div className="absolute inset-0 overflow-hidden rounded-b-lg">
					<Image
						src="/hero-home.png"
						alt="Hero Background"
						fill
						sizes="100vw"
						priority
						className="absolute inset-0 h-full w-full object-cover object-center"
					/>
					<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,16,29,0.72)_0%,rgba(9,16,29,0.52)_42%,rgba(9,16,29,0.66)_100%)]" />
				</div>

				<div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] flex-col px-4 pt-12 text-white sm:px-8 sm:pt-16 lg:px-10 xl:pt-20">
					<div className="max-w-[760px]">
						<h1 className="text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[44px] lg:text-[54px] xl:text-[62px]">
							Find your next home with clarity.
						</h1>
						<p className="mt-1 text-base font-medium leading-relaxed text-white/88 sm:text-lg lg:text-xl">
							Browse verified listings, compare options quickly, and move forward with confidence.
						</p>
					</div>

					<div className="absolute bottom-0 left-0 right-0 translate-y-[-10%] px-4 sm:px-8 lg:px-10 xl:translate-y-1/3">
						<div className="mx-auto w-full max-w-[1240px]">
							<div className="mb-4 flex items-end gap-2 sm:mb-4 sm:gap-2">
								<button
									type="button"
									onClick={() => setMode("Buy")}
									className={`relative min-w-[96px] rounded-lg px-3 py-2.5 text-lg font-semibold transition sm:min-w-[96px] sm:px-3 sm:py-2 sm:text-lg ${
										mode === "Buy"
											? "bg-[#ec6767] text-white"
											: "bg-white text-slate-700"
									}`}
								>
									Buy
									{mode === "Buy" && (
										<span className="absolute left-1/2 top-99/100 h-0 w-0 -translate-x-1/2 border-l-[11px] border-r-[11px] border-t-[11px] border-l-transparent border-r-transparent border-t-[#ec6767]" />
									)}
								</button>
								<button
									type="button"
									onClick={() => setMode("Rent")}
									className={`relative min-w-[96px] rounded-lg px-3 py-2.5 text-lg font-semibold transition sm:min-w-[96px] sm:px-3 sm:py-2 sm:text-lg ${
										mode === "Rent"
											? "bg-[#ec6767] text-white"
											: "bg-white text-slate-700"
									}`}
								>
									Rent
									{mode === "Rent" && (
										<span className="absolute left-1/2 top-99/100 h-0 w-0 -translate-x-1/2 border-l-[11px] border-r-[11px] border-t-[11px] border-l-transparent border-r-transparent border-t-[#ec6767]" />
									)}
								</button>
							</div>

							<div className="rounded-lg bg-white px-4 py-4 shadow-[0_16px_36px_rgba(12,18,28,0.2)] sm:px-6 sm:py-5">
								<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
									<input
										type="text"
										placeholder="Enter keyword..."
										value={keyword}
										onChange={(event) => setKeyword(event.target.value)}
										className="h-14 rounded-lg border border-slate-200 px-5 text-[16px] font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-[#eb6666] focus:ring-2 focus:ring-[#eb6666]/15"
									/>

									<div className="relative">
										<select
											value={propertyType}
											onChange={(event) => setPropertyType(event.target.value)}
											className="h-14 w-full appearance-none rounded-lg border border-slate-200 px-5 pr-12 text-[16px] font-medium text-slate-700 outline-none transition focus:border-[#eb6666] focus:ring-2 focus:ring-[#eb6666]/15"
										>
											<option value="">Property Type</option>
											{PROPERTY_TYPE_OPTIONS.filter(Boolean).map((option) => (
												<option key={option} value={option}>{option}</option>
											))}
										</select>
										<ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
									</div>

									<div className="relative">
										<input
											type="text"
											placeholder="Location"
											value={location}
											onChange={(event) => setLocation(event.target.value)}
											className="h-14 w-full rounded-lg border border-slate-200 px-5 pr-12 text-[16px] font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-[#eb6666] focus:ring-2 focus:ring-[#eb6666]/15"
										/>
										<MapPin size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
									</div>

									<div className="relative">
										<select
											value={priceRange}
											onChange={(event) => setPriceRange(event.target.value)}
											className="h-14 w-full appearance-none rounded-lg border border-slate-200 px-5 pr-12 text-[16px] font-medium text-slate-700 outline-none transition focus:border-[#eb6666] focus:ring-2 focus:ring-[#eb6666]/15"
										>
											<option value="">Price</option>
											{PRICE_RANGE_OPTIONS.filter(Boolean).map((option) => (
												<option key={option} value={option}>{option}</option>
											))}
										</select>
										<ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
									</div>

									<button
										type="button"
										onClick={handleSearch}
										className="h-14 rounded-lg bg-[#ec6767] px-9 text-[18px] font-bold text-white transition hover:bg-[#e35858]"
									>
										Search
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

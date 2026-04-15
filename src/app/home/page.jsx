import Hero from "@/app/ui/home/hero";
import LatestForSale from "@/app/ui/home/latest-forsale";
import LatestForRent from "@/app/ui/home/latest-forrent";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#f3f4f6]">
            <div className="max-w-auto w-97/100 mx-auto px-6 sm:px-1 mb-4lo sm:w-90/100">
                <Hero />
                <LatestForSale />
                <LatestForRent />
            </div>
        </div>
    );
}
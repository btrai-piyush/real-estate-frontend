const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
    return (
        <div
            className={`${shimmer} relative overflow-hidden rounded-lg bg-gray-100 p-2 shadow-sm`}
        >
            <div className="flex p-4">
                <div className="h-5 w-5 rounded-md bg-gray-200" />
                <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
            </div>
            <div className="flex items-center justify-center truncate rounded-lg bg-white px-4 py-8">
                <div className="h-7 w-20 rounded-md bg-gray-200" />
            </div>
        </div>
    );
}

export function CardsSkeleton() {
    return (
        <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </>
    );
}

export function ListingsSkeleton() {
    return <ListingGridSkeleton />;
}

function ListingCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-100/60 bg-white shadow-sm">
            <div className={`${shimmer} relative h-52 overflow-hidden bg-gray-200 sm:h-60 xl:h-64`} />

            <div className="space-y-3 px-4 pt-4 sm:px-5">
                <div className={`${shimmer} relative h-4 w-24 overflow-hidden rounded-md bg-gray-100`} />
                <div className={`${shimmer} relative h-6 w-3/4 overflow-hidden rounded-md bg-gray-100`} />
                <div className={`${shimmer} relative h-4 w-2/3 overflow-hidden rounded-md bg-gray-100`} />
                <div className={`${shimmer} relative h-4 w-1/3 overflow-hidden rounded-md bg-gray-100`} />
            </div>

            <div className="mt-4 border-t border-gray-100 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-center gap-3">
                    <div className={`${shimmer} relative h-10 w-10 overflow-hidden rounded-full bg-gray-100 sm:h-12 sm:w-12`} />
                    <div className={`${shimmer} relative h-5 w-32 overflow-hidden rounded-md bg-gray-100`} />
                </div>
            </div>
        </div>
    );
}

export function ListingGridSkeleton({ count = 4, className = "", showHeader = false }) {
    return (
        <div className={className}>
            {showHeader && (
                <div className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`} />
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-2">
                {Array.from({ length: count }).map((_, index) => (
                    <ListingCardSkeleton key={`listing-skeleton-${index}`} />
                ))}
            </div>
        </div>
    );
}
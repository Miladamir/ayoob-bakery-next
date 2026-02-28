export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
    );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <Skeleton className="h-72 w-full rounded-none" />
            <div className="p-5 space-y-4">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Product Page Skeleton
export function ProductPageSkeleton() {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Gallery */}
                <div className="space-y-4">
                    <Skeleton className="w-full aspect-square rounded-2xl" />
                    <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-xl" />
                        ))}
                    </div>
                </div>
                {/* Info */}
                <div className="space-y-6 pt-8">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    currentFilters: any;
}

export default function Pagination({ currentPage, totalPages, currentFilters }: PaginationProps) {
    const createUrl = (page: number) => {
        const params = new URLSearchParams(currentFilters);
        params.set('page', page.toString());
        return `/products?${params.toString()}`;
    };

    return (
        <div className="mt-16 flex justify-center items-center gap-2">
            {currentPage > 1 && (
                <Link href={createUrl(currentPage - 1)} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors">
                    <i className="fa-solid fa-arrow-left text-sm"></i>
                </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                    key={page}
                    href={createUrl(page)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${page === currentPage
                            ? 'bg-brand-900 text-white'
                            : 'border border-gray-200 hover:bg-brand-500 hover:text-white hover:border-brand-500'
                        }`}
                >
                    {page}
                </Link>
            ))}

            {currentPage < totalPages && (
                <Link href={createUrl(currentPage + 1)} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors">
                    <i className="fa-solid fa-arrow-right text-sm"></i>
                </Link>
            )}
        </div>
    );
}
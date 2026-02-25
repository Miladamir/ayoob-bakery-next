import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";

interface SearchParams {
    q?: string;
}

interface Props {
    searchParams: SearchParams;
}

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: Props) {
    const query = searchParams.q || "";

    // Fix: Explicitly type products as any[]
    let products: any[] = [];

    await dbConnect();

    if (query) {
        // Search in name, description, and shortDescription
        products = await Product.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { shortDescription: { $regex: query, $options: "i" } }
            ]
        }).populate('category').lean();
    }

    // Fetch categories for sidebar
    const categories = await Category.find({ parent: null }).lean();

    // Serialize for client components
    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedCategories = JSON.parse(JSON.stringify(categories));

    return (
        <>
            {/* Hero Section with Search Bar */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Search Results</h1>

                    {/* Active Search Bar */}
                    <form action="/search" method="GET" className="max-w-2xl mx-auto relative">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search for breads, pastries, cakes..."
                            defaultValue={query}
                            className="w-full bg-white border-2 border-transparent rounded-full py-5 px-8 pr-32 text-lg text-gray-800 focus:outline-none focus:border-brand-500 transition-all shadow-lg"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 text-white px-8 py-3 rounded-full font-bold uppercase text-sm tracking-wider hover:bg-brand-700 transition-colors shadow-md"
                        >
                            Search
                        </button>
                    </form>

                    {/* Quick Tags */}
                    <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                        <span className="text-brand-300">Popular:</span>
                        <Link href="/search?q=Croissant" className="text-white hover:text-brand-300 font-medium">Croissant</Link>
                        <Link href="/search?q=Sourdough" className="text-white hover:text-brand-300 font-medium">Sourdough</Link>
                        <Link href="/search?q=Gluten+Free" className="text-white hover:text-brand-300 font-medium">Gluten Free</Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Sidebar */}
                        <aside className="lg:w-1/4 hidden lg:block">
                            <div className="sticky top-28 space-y-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-xs">Categories</h3>
                                    <div className="space-y-2">
                                        <Link href="/products" className="block py-2 text-gray-600 hover:text-brand-700 hover:bg-brand-50 px-2 rounded transition-colors">All Products</Link>
                                        {serializedCategories.map((cat: any) => (
                                            <Link key={cat._id} href={`/products?category=${cat._id}`} className="block py-2 text-gray-600 hover:text-brand-700 hover:bg-brand-50 px-2 rounded transition-colors">
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Results Grid */}
                        <main className="lg:w-3/4">
                            {/* Utility Bar */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-gray-200">
                                <p className="text-gray-500">
                                    Showing <span className="font-bold text-gray-800">{products.length}</span> results for "<span className="font-bold text-brand-600">{query}</span>"
                                </p>
                            </div>

                            {serializedProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {serializedProducts.map((product: any) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <i className="fa-solid fa-magnifying-glass text-4xl"></i>
                                    </div>
                                    <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">No Results Found</h2>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">We couldn't find any products matching your search. Try a different keyword or browse our categories.</p>
                                    <Link href="/products" className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold uppercase text-sm tracking-wider hover:bg-brand-700 transition-colors">
                                        Browse Menu
                                    </Link>
                                </div>
                            )}
                        </main>

                    </div>
                </div>
            </section>
        </>
    );
}
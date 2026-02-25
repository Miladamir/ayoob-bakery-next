import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductGallery from "@/components/product/ProductGallery";
import ProductActions from "@/components/product/ProductActions";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCard from "@/components/ui/ProductCard";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>; // Fix: params is a Promise
}

export default async function ProductDetailPage({ params }: Props) {
    // Fix: Await params
    const { id } = await params;

    await dbConnect();

    const product = await Product.findById(id).populate('category').lean();

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-700">Product not found</h1>
            </div>
        );
    }

    const category = product.category as any;

    // Fetch related products
    const relatedProducts = await Product.find({
        category: category._id || category,
        _id: { $ne: product._id }
    }).limit(4).lean();

    // Serialize data
    const serializedProduct = JSON.parse(JSON.stringify(product));
    const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

    // Breadcrumb logic
    const breadcrumb = [
        { name: 'Home', href: '/' },
        { name: 'Menu', href: '/products' },
        { name: category?.name || 'Category', href: `/products?category=${category._id || category}` },
        { name: product.name, href: '#' }
    ];

    return (
        <>
            {/* Hero Header */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <nav className="flex mb-6 text-sm text-brand-300">
                        {breadcrumb.map((item, i) => (
                            <span key={i} className="flex items-center">
                                <a href={item.href} className="hover:text-white transition-colors">{item.name}</a>
                                {i < breadcrumb.length - 1 && <i className="fa-solid fa-chevron-right text-xs text-brand-500 mx-2"></i>}
                            </span>
                        ))}
                    </nav>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold">{product.name}</h1>
                </div>
            </section>

            {/* Main Product Section */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                        <ProductGallery images={serializedProduct.images} />
                        <div className="flex flex-col justify-center">
                            <ProductActions product={serializedProduct} />
                        </div>
                    </div>
                </div>
            </section>

            <ProductTabs product={serializedProduct} />

            {/* Related Products */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-brand-500 font-bold tracking-widest uppercase text-xs">You Might Also Like</span>
                            <h2 className="font-serif text-3xl md:text-4xl text-gray-800 font-bold mt-1">Related Products</h2>
                        </div>
                        <a href={`/products?category=${category._id || category}`} className="hidden md:flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 group">
                            View All <i className="fa-solid fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
                        </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {serializedRelated.map((p: any) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
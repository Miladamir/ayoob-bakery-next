import Link from "next/link";
import { NestedCategory } from "@/lib/data";

interface FooterProps {
    nestedCategories: NestedCategory[];
}

export default function Footer({ nestedCategories }: FooterProps) {
    return (
        <footer className="site-footer bg-gray-900 text-gray-400 py-16">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="text-white font-serif text-2xl font-bold hover:text-brand-400 transition-colors">
                            Ayoob Bakery Australia
                        </Link>
                        <p className="mt-4 text-sm">Crafting joy, one bite at a time.</p>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Shop</h3>
                        <ul className="space-y-2">
                            <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                            {nestedCategories.slice(0, 4).map((cat) => (
                                <li key={cat._id.toString()}>
                                    <Link href={`/products?category=${cat._id}`} className="hover:text-white transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/blogs" className="hover:text-white transition-colors">Blogs</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white text-xl"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="hover:text-white text-xl"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="hover:text-white text-xl"><i className="fab fa-pinterest-p"></i></a>
                        </div>
                        <div className="mt-6 text-sm">
                            <p><i className="fas fa-phone mr-2 text-brand-500"></i> +61 123 456 789</p>
                            <p className="mt-2"><i className="fas fa-envelope mr-2 text-brand-500"></i> info@ayoobbakery.com.au</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Ayoob Bakery Australia. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
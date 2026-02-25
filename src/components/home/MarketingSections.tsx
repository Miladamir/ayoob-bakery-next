export default function MarketingSections() {
    return (
        <>
            {/* Catering Section */}
            <section className="section-padding bg-white">
                <div className="container mx-auto px-6">
                    <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">
                        <div className="p-12 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold text-white mb-4">Catering & Events</h2>
                            <p className="text-gray-300 mb-6">Planning a wedding, corporate event, or family gathering? Let us handle the baking.</p>
                            <ul className="text-gray-400 space-y-3 mb-8">
                                <li><i className="fa-solid fa-check text-brand-400 mr-2"></i> Custom Wedding Cakes</li>
                                <li><i className="fa-solid fa-check text-brand-400 mr-2"></i> Corporate Breakfast Boxes</li>
                                <li><i className="fa-solid fa-check text-brand-400 mr-2"></i> Wholesale Bread Supply</li>
                            </ul>
                            <a href="/contact" className="btn btn-primary w-fit">Get a Quote</a>
                        </div>
                        <div className="h-64 md:h-auto relative">
                            <img src="https://images.unsplash.com/photo-1519340333755-56e9c1d04579?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Catering" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="section-padding bg-brand-50">
                <div className="container mx-auto px-6 text-center">
                    <i className="fab fa-instagram text-3xl text-gray-700 mb-2"></i>
                    <h2 className="text-3xl font-bold mb-2">@AyoobBakeryAustralia</h2>
                    <p className="text-gray-500 mb-8">Follow us for daily drool-worthy updates</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            "https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=1936&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1579306093888-c69027d39ca8?q=80&w=1935&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1505253758473-96b701d8fe8e?q=80&w=1974&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1932&auto=format&fit=crop"
                        ].map((src, i) => (
                            <div key={i} className="relative overflow-hidden rounded-xl aspect-square group cursor-pointer">
                                <img src={src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Instagram" />
                                <div className="absolute inset-0 bg-brand-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <i className="fas fa-heart text-white text-2xl"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="section-padding bg-gray-900 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-2">What Our Neighbors Say</h2>
                    <div className="w-16 h-1 bg-brand-500 mx-auto mb-12"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-white/5 p-8 rounded-2xl text-left">
                            <i className="fas fa-quote-left text-brand-500 text-2xl mb-4 opacity-50"></i>
                            <p className="text-gray-300 italic mb-6">"The best sourdough I have ever tasted outside of San Francisco. The crust is perfectly crunchy..."</p>
                            <div className="flex text-yellow-400 mb-2">
                                {[1, 2, 3, 4, 5].map(i => <i key={i} className="fas fa-star"></i>)}
                            </div>
                            <h4 className="font-bold text-white">Sarah Johnson</h4>
                        </div>
                        {/* Testimonial 2 */}
                        <div className="bg-white/5 p-8 rounded-2xl text-left transform md:-translate-y-4">
                            <i className="fas fa-quote-left text-brand-500 text-2xl mb-4 opacity-50"></i>
                            <p className="text-gray-300 italic mb-6">"I ordered the chocolate cake for my wife's birthday. It was stunning and tasted divine."</p>
                            <div className="flex text-yellow-400 mb-2">
                                {[1, 2, 3, 4, 5].map(i => <i key={i} className="fas fa-star"></i>)}
                            </div>
                            <h4 className="font-bold text-white">Michael Chen</h4>
                        </div>
                        {/* Testimonial 3 */}
                        <div className="bg-white/5 p-8 rounded-2xl text-left">
                            <i className="fas fa-quote-left text-brand-500 text-2xl mb-4 opacity-50"></i>
                            <p className="text-gray-300 italic mb-6">"My morning routine isn't complete without a coffee and croissant from Ayoob Bakery."</p>
                            <div className="flex text-yellow-400 mb-2">
                                {[1, 2, 3, 4, 5].map(i => <i key={i} className="fas fa-star"></i>)}
                            </div>
                            <h4 className="font-bold text-white">Emily Davis</h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="section-padding bg-white">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {/* FAQ Item 1 */}
                        <details className="group border-b border-gray-200 pb-4">
                            <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-lg text-gray-800">
                                Do you offer gluten-free options?
                                <span className="transition group-open:rotate-180"><i className="fas fa-chevron-down text-brand-500"></i></span>
                            </summary>
                            <p className="text-gray-600 mt-4">Yes! We bake fresh gluten-free bread every Tuesday and Friday. We also have a selection of GF pastries available daily.</p>
                        </details>
                        {/* FAQ Item 2 */}
                        <details className="group border-b border-gray-200 pb-4">
                            <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-lg text-gray-800">
                                Can I place a custom order for a cake?
                                <span className="transition group-open:rotate-180"><i className="fas fa-chevron-down text-brand-500"></i></span>
                            </summary>
                            <p className="text-gray-600 mt-4">Absolutely. We require 48 hours notice for standard cakes and 1 week for custom-designed celebration cakes.</p>
                        </details>
                        {/* FAQ Item 3 */}
                        <details className="group border-b border-gray-200 pb-4">
                            <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-lg text-gray-800">
                                Do you deliver?
                                <span className="transition group-open:rotate-180"><i className="fas fa-chevron-down text-brand-500"></i></span>
                            </summary>
                            <p className="text-gray-600 mt-4">We offer local delivery within a 5-mile radius for orders over $30. For larger catering orders, we deliver city-wide.</p>
                        </details>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="section-padding bg-brand-50">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Join the Bread Club</h2>
                            <p className="text-gray-500 mb-6">Sign up for our newsletter to get fresh updates, secret recipes, and an exclusive <span className="text-brand-600 font-bold">15% off</span> your first order.</p>
                            <form className="flex gap-2">
                                <input type="email" placeholder="Your email address" className="flex-grow px-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-brand-500" />
                                <button className="btn btn-primary">SUBSCRIBE</button>
                            </form>
                            <div className="mt-8 grid grid-cols-2 gap-8 text-sm text-gray-600 border-t pt-8">
                                <div>
                                    <h5 className="font-bold mb-1">Visit Us</h5>
                                    <p>123 Bread Street<br />Culinary District, NY 10012</p>
                                </div>
                                <div>
                                    <h5 className="font-bold mb-1">Opening Hours</h5>
                                    <p>Mon-Sat: 7am - 8pm<br />Sun: 8am - 6pm</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-80 rounded-2xl overflow-hidden hidden md:block">
                            <img src="https://images.unsplash.com/photo-1577563821016-01f11c750b99?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover brightness-75" alt="Bakery Interior" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <a href="https://maps.google.com" target="_blank" className="btn bg-white text-brand-600 hover:bg-gray-100"><i className="fas fa-location-dot mr-2"></i> Get Directions</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
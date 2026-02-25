import Link from "next/link";

export default function AboutPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] bg-brand-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-40" alt="Bakery Background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-transparent to-brand-800/50"></div>
                </div>
                <div className="relative z-10 text-center px-6 mt-20">
                    <span className="inline-block text-brand-300 uppercase tracking-[0.4em] text-sm font-bold mb-4">Established 1985</span>
                    <h1 className="font-serif text-5xl md:text-7xl text-white font-bold mb-6 drop-shadow-lg">Our Story</h1>
                    <div className="w-20 h-1 bg-brand-500 mx-auto rounded-full"></div>
                </div>
            </section>

            {/* Introduction Section */}
            <section className="py-24 bg-white relative">
                <div className="absolute top-0 left-0 right-0 h-24 bg-brand-50" style={{ clipPath: "ellipse(70% 100% at 50% 0%)" }}></div>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Image */}
                        <div className="lg:w-1/2 relative">
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1586548545831-7b9015c13c7a?q=80&w=1964&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Baker Kneading Dough" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-full h-full bg-brand-100 rounded-2xl z-0"></div>
                        </div>

                        {/* Text */}
                        <div className="lg:w-1/2 space-y-6">
                            <span className="text-brand-500 font-bold tracking-widest uppercase text-sm">Who We Are</span>
                            <h2 className="font-serif text-4xl md:text-5xl text-gray-800 font-bold leading-tight">
                                Baking With <span className="italic text-brand-600">Purpose</span> & Passion
                            </h2>
                            <div className="w-16 h-1 bg-brand-300 rounded-full"></div>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                Ayoob Bakery started as a small family kitchen dream in 1985. What began with a single wood-fired oven and a cherished sourdough starter has grown into one of Australia's most beloved artisan bakeries.
                            </p>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                We believe that great bread takes time. While the world speeds up, we slow down. Our bakers work through the night, respecting the natural rhythms of fermentation to bring you loaves that are not just food, but an experience.
                            </p>

                            <div className="pt-4 border-l-4 border-brand-500 pl-4 mt-8">
                                <p className="font-serif text-xl text-gray-700 italic">"We don't just bake bread; we preserve a tradition."</p>
                                <p className="mt-2 font-bold text-brand-600 uppercase tracking-wide text-sm">— Ahmed Ayoob, Founder</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values / Pillars Section */}
            <section className="py-24 bg-brand-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-brand-500 font-bold tracking-widest uppercase text-sm">Our Philosophy</span>
                        <h2 className="font-serif text-4xl md:text-5xl text-gray-800 font-bold mt-2">The Three Pillars</h2>
                        <p className="text-gray-500 mt-4 text-lg">Everything we do is guided by a commitment to quality, community, and the craft.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Value 1 */}
                        <div className="bg-white p-10 rounded-2xl shadow-lg border border-brand-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                            <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-6 text-brand-600">
                                <i className="fa-solid fa-seedling text-3xl"></i>
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">Sustainable Sourcing</h3>
                            <p className="text-gray-500 leading-relaxed">We partner with local Australian farmers who share our respect for the land. From stone-ground flour to free-range eggs, every ingredient is chosen with care.</p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white p-10 rounded-2xl shadow-lg border border-brand-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                            <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-6 text-brand-600">
                                <i className="fa-solid fa-clock-rotate-left text-3xl"></i>
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">Time-Honored Methods</h3>
                            <p className="text-gray-500 leading-relaxed">No shortcuts. Our doughs ferment for up to 72 hours, developing deep flavors and textures that modern industrial baking simply cannot replicate.</p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white p-10 rounded-2xl shadow-lg border border-brand-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                            <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-6 text-brand-600">
                                <i className="fa-solid fa-hand-holding-heart text-3xl"></i>
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">Community First</h3>
                            <p className="text-gray-500 leading-relaxed">Ayoob Bakery is a gathering place. We donate day-old bread to local shelters and host workshops to pass the art of baking to the next generation.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section (Specific to About Page) */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-brand-500 font-bold tracking-widest uppercase text-sm">The Artisans</span>
                        <h2 className="font-serif text-4xl md:text-5xl text-gray-800 font-bold mt-2">Meet Our Team</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center group">
                            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-brand-100 transition-colors duration-300">
                                <img src="https://randomuser.me/api/portraits/men/45.jpg" className="w-full h-full object-cover" alt="Ahmed Ayoob" />
                            </div>
                            <h4 className="font-serif text-2xl font-bold text-gray-800">Ahmed Ayoob</h4>
                            <p className="text-brand-500 uppercase text-sm tracking-widest font-semibold">Founder & Master Baker</p>
                            <p className="mt-3 text-gray-400 text-sm max-w-xs mx-auto">Keeping the family legacy alive with every loaf.</p>
                        </div>

                        <div className="text-center group">
                            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-brand-100 transition-colors duration-300">
                                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-full h-full object-cover" alt="Sarah Miles" />
                            </div>
                            <h4 className="font-serif text-2xl font-bold text-gray-800">Sarah Miles</h4>
                            <p className="text-brand-500 uppercase text-sm tracking-widest font-semibold">Head Pastry Chef</p>
                            <p className="mt-3 text-gray-400 text-sm max-w-xs mx-auto">The creative mind behind our delicate pastries.</p>
                        </div>

                        <div className="text-center group">
                            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-brand-100 transition-colors duration-300">
                                <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-full h-full object-cover" alt="Liam Chen" />
                            </div>
                            <h4 className="font-serif text-2xl font-bold text-gray-800">Liam Chen</h4>
                            <p className="text-brand-500 uppercase text-sm tracking-widest font-semibold">Operations Manager</p>
                            <p className="mt-3 text-gray-400 text-sm max-w-xs mx-auto">Ensuring every kitchen runs like clockwork.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-brand-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h2 className="font-serif text-3xl md:text-5xl text-white font-bold mb-6">Experience the Difference</h2>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">Come visit us and smell the fresh bread. We promise you'll leave with a smile and a warm loaf.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/products" className="bg-brand-500 text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-brand-600 transition-all transform hover:scale-105 shadow-lg">View Our Menu</Link>
                        <Link href="/contact" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-brand-900 transition-all">Find a Location</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
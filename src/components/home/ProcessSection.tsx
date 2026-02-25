export default function ProcessSection() {
    return (
        <section className="section-padding bg-white">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-brand-500 font-semibold tracking-widest uppercase text-sm">The Art of Baking</span>
                        <h2 className="text-4xl font-bold mt-2 mb-8">How We Make It Happen</h2>

                        {/* Step 1 */}
                        <div className="flex gap-5 mb-8">
                            <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">1</div>
                            <div>
                                <h4 className="text-xl font-bold mb-1">The Mix</h4>
                                <p className="text-gray-500">We combine organic flour, purified water, and our 30-year-old starter culture.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-5 mb-8">
                            <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">2</div>
                            <div>
                                <h4 className="text-xl font-bold mb-1">Slow Fermentation</h4>
                                <p className="text-gray-500">The dough rests for up to 48 hours to develop complex flavors and digestibility.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-5">
                            <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">3</div>
                            <div>
                                <h4 className="text-xl font-bold mb-1">Stone Baked</h4>
                                <p className="text-gray-500">Baked on hot stone hearths to achieve the perfect golden-brown crust.</p>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="relative hidden lg:block">
                        <img
                            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop"
                            className="rounded-2xl shadow-xl w-full h-[500px] object-cover"
                            alt="Bread"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1586548545831-7b9015c13c7a?q=80&w=1964&auto=format&fit=crop"
                            className="absolute w-1/2 h-64 object-cover bottom-[-30px] right-[-30px] rounded-2xl border-4 border-white shadow-xl"
                            alt="Kneading"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
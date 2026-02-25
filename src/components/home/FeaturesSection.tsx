export default function FeaturesSection() {
    return (
        <section className="section-padding bg-white -mt-12 rounded-t-[30px] relative z-5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {/* Feature 1 */}
                    <div className="p-5">
                        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5 text-brand-600">
                            <i className="fa-solid fa-wheat-awn fa-2x"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Organic Ingredients</h3>
                        <p className="text-gray-500">We source only the finest organic flours and locally grown produce for our recipes.</p>
                    </div>
                    {/* Feature 2 */}
                    <div className="p-5">
                        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5 text-brand-600">
                            <i className="fa-solid fa-fire-burner fa-2x"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Baked Fresh Daily</h3>
                        <p className="text-gray-500">Our ovens start at 3 AM every morning to ensure you get the warmest, freshest experience.</p>
                    </div>
                    {/* Feature 3 */}
                    <div className="p-5">
                        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5 text-brand-600">
                            <i className="fa-solid fa-heart fa-2x"></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Made with Love</h3>
                        <p className="text-gray-500">Every loaf, pastry, and cake is handcrafted by our team of passionate artisan bakers.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
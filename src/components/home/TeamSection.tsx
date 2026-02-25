export default function TeamSection() {
    const team = [
        { name: "Arthur Gold", role: "Master Baker", img: "https://randomuser.me/api/portraits/men/32.jpg", desc: "Founded Golden Crumb in 1985 with a passion for sourdough." },
        { name: "Elena Miles", role: "Head Pastry Chef", img: "https://randomuser.me/api/portraits/women/44.jpg", desc: "Specializes in delicate French pastries and intricate cake designs." },
        { name: "David Chen", role: "Artisan Baker", img: "https://randomuser.me/api/portraits/men/85.jpg", desc: "Expert in gluten-free recipes and ancient grain fermentations." },
    ];

    return (
        <section className="section-padding bg-brand-50">
            <div className="container mx-auto px-6 text-center">
                <span className="text-brand-500 font-semibold tracking-widest uppercase text-sm">The Team</span>
                <h2 className="text-4xl font-bold mt-2 mb-12">Meet the Artisans</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((member, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <img
                                src={member.img}
                                className="w-24 h-24 rounded-full border-4 border-brand-500 mx-auto mb-4 object-cover"
                                alt={member.name}
                            />
                            <h3 className="text-xl font-bold text-brand-600">{member.name}</h3>
                            <p className="text-brand-500 uppercase text-sm font-semibold mb-3">{member.role}</p>
                            <p className="text-gray-500 text-sm">{member.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
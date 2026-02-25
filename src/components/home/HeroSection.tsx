import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="hero-index">
            <div className="container" style={{ zIndex: 2, position: 'relative' }}>
                <p style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 600, marginBottom: '10px' }}>
                    Since 1985
                </p>
                <h1 style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', marginBottom: '20px' }}>
                    Taste the <em style={{ color: 'var(--accent)' }}>Magic</em> <br /> of Real Bread
                </h1>
                <p className="text-lead" style={{ color: 'white', opacity: 0.9, maxWidth: '800px', margin: '0 auto 30px' }}>
                    Handcrafted daily using organic flour, natural yeast, and patience. Experience the warmth of fresh baking in every bite.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="#menu" className="btn btn-primary">VIEW MENU</Link>
                    <Link href="/contact" className="btn btn-secondary">VISIT US</Link>
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)' }} className="bounce">
                <i className="fas fa-chevron-down" style={{ color: 'white', fontSize: '1.5rem' }}></i>
            </div>
        </section>
    );
}
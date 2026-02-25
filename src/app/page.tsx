import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import Product from "@/models/Product";
import ProductTabs from "@/components/home/ProductTabs";
import SpecialOffers from "@/components/home/SpecialOffers";
import HeroSection from "@/components/home/HeroSection";
import MarketingSections from "@/components/home/MarketingSections";

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();

  // 1. Fetch Banners
  const banners = await Banner.find({ isActive: true }).sort({ order: 1 }).lean();

  // 2. Fetch Products by Badge
  const bestSelling = await Product.find({ badge: 'Bestseller' }).limit(4).populate('category').lean();
  const newArrivals = await Product.find({ badge: 'New' }).limit(4).populate('category').lean();
  const popular = await Product.find({ badge: 'Popular' }).limit(4).populate('category').lean();
  const featured = await Product.find({ badge: 'Featured' }).limit(4).populate('category').lean();

  // Serialize data for client components
  const serialize = (data: any[]) => JSON.parse(JSON.stringify(data));

  return (
    <main>
      {/* 
         Note: The specific CSS classes (like .hero-index, .products-grid, etc.) 
         that were in the <style> block are missing from globals.css.
         We will add them in the NEXT step to fix the layout perfectly.
      */}

      <HeroSection />

      {/* Features Section is inside MarketingSections now, or we add it here */}
      <section className="section-padding" style={{ background: "white", marginTop: "-50px", borderRadius: "30px 30px 0 0", position: "relative", zIndex: 5 }}>
        <div className="container">
          <div className="grid grid-3 text-center">
            <div style={{ padding: "20px" }}>
              <div style={{ width: "60px", height: "60px", background: "rgba(195, 117, 96, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--primary)" }}>
                <i className="fa-solid fa-wheat-awn fa-2x"></i>
              </div>
              <h3>Organic Ingredients</h3>
              <p>We source only the finest organic flours and locally grown produce for our recipes.</p>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ width: "60px", height: "60px", background: "rgba(195, 117, 96, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--primary)" }}>
                <i className="fa-solid fa-fire-burner fa-2x"></i>
              </div>
              <h3>Baked Fresh Daily</h3>
              <p>Our ovens start at 3 AM every morning to ensure you get the warmest, freshest experience.</p>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ width: "60px", height: "60px", background: "rgba(195, 117, 96, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--primary)" }}>
                <i className="fa-solid fa-heart fa-2x"></i>
              </div>
              <h3>Made with Love</h3>
              <p>Every loaf, pastry, and cake is handcrafted by our team of passionate artisan bakers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Special Offers */}
      <SpecialOffers offers={serialize(banners)} />

      {/* Product Tabs (Best Selling, New, etc.) */}
      <ProductTabs
        bestSelling={serialize(bestSelling)}
        newArrivals={serialize(newArrivals)}
        popular={serialize(popular)}
        featured={serialize(featured)}
      />

      {/* Marketing Sections (Process, Team, Catering, etc.) */}
      <MarketingSections />

    </main>
  );
}
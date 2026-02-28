import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from "@/components/home/HeroSection";
import MarketingSections from "@/components/home/MarketingSections";
import ProductTabs from "@/components/home/ProductTabs";
// import SpecialOffers from "@/components/home/SpecialOffers"; // Replaced by dynamic import below
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Banner from "@/models/Banner";
import { Skeleton } from "@/components/ui/Skeleton"; // Simple skeleton for offers

// Dynamically import SpecialOffers
const SpecialOffers = dynamic(() => import("@/components/home/SpecialOffers"), {
  loading: () => (
    <section className="section-padding bg-brand-900 animate-pulse">
      <div className="container mx-auto text-center">
        <Skeleton className="h-10 w-1/2 mx-auto mb-6" />
        <Skeleton className="h-16 w-1/3 mx-auto mb-8" />
      </div>
    </section>
  ),
  ssr: true, // Keep SSR for SEO
});

// Loading Skeletons for better UX
function ProductTabsSkeleton() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-6">
        <div className="animate-pulse flex space-x-4 justify-center mb-12">
          <div className="h-12 w-32 bg-gray-200 rounded-full"></div>
          <div className="h-12 w-32 bg-gray-200 rounded-full"></div>
          <div className="h-12 w-32 bg-gray-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OffersSkeleton() {
  return (
    <section className="section-padding bg-brand-900 animate-pulse">
      <div className="container mx-auto text-center">
        <div className="h-10 w-1/2 bg-white/20 mx-auto mb-6 rounded-lg"></div>
        <div className="h-16 w-1/3 bg-white/20 mx-auto mb-8 rounded-lg"></div>
        <div className="h-14 w-40 bg-white/20 mx-auto rounded-full"></div>
      </div>
    </section>
  );
}

// Server Component that fetches data for Products
async function ProductTabsLoader() {
  await dbConnect();
  const [bestSelling, newArrivals, popular, featured] = await Promise.all([
    Product.find({ badge: 'Bestseller' }).limit(4).populate('category').lean(),
    Product.find({ badge: 'New' }).limit(4).populate('category').lean(),
    Product.find({ badge: 'Popular' }).limit(4).populate('category').lean(),
    Product.find({ badge: 'Featured' }).limit(4).populate('category').lean(),
  ]);

  const serialize = (data: any[]) => JSON.parse(JSON.stringify(data));

  return (
    <ProductTabs
      bestSelling={serialize(bestSelling)}
      newArrivals={serialize(newArrivals)}
      popular={serialize(popular)}
      featured={serialize(featured)}
    />
  );
}

// Server Component that fetches data for Offers
async function OffersLoader() {
  await dbConnect();
  const banners = await Banner.find({ isActive: true }).sort({ order: 1 }).lean();
  const serializedBanners = JSON.parse(JSON.stringify(banners));
  return <SpecialOffers offers={serializedBanners} />;
}

export default function Home() {
  return (
    <>
      {/* Hero loads instantly */}
      <HeroSection />

      {/* Features Section */}
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

      {/* Offers - Fetched in parallel with Products */}
      <Suspense fallback={<OffersSkeleton />}>
        <OffersLoader />
      </Suspense>

      {/* Products - Streamed in after DB fetch */}
      <Suspense fallback={<ProductTabsSkeleton />}>
        <ProductTabsLoader />
      </Suspense>

      {/* Static Marketing Sections */}
      <MarketingSections />
    </>
  );
}
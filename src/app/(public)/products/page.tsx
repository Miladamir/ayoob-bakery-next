import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { getNestedCategories } from "@/lib/data";
import { stripHtml } from "@/lib/format";
import Shop from "@/components/shop/Shop";
import ShopFaqs from "@/components/shop/ShopFaqs";
import ShopContact from "@/components/shop/ShopContact";
import { SITE_URL as siteUrl, BUSINESS_NAME } from "@/lib/site";
import "./products.css";

/* PHASE 4 — ISR: this page no longer reads searchParams (filter state
   is read client-side by Shop on mount), so the whole catalog page is
   prerendered and served from the cache. Admin product mutations call
   revalidatePath('/products'). */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "All Products — The Board",
  description:
    "Browse every Afghan pastry and bake at Ayoob Bakery — coconut puffs, cardamom shortbread, cream horns, braided breads and more, fresh every morning in Dandenong North.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  await dbConnect();

  // one query for the whole board + the category tree
  const [products, nestedCategories] = await Promise.all([
    Product.find({})
      .select("name price images unit discount badge shortDescription description category ratings")
      .sort({ createdAt: -1 })
      .lean(),
    getNestedCategories(),
  ]);

  // map every category (top + sub) to its TOP-LEVEL parent,
  // so products in subcategories show under their parent's chip
  const catInfo = new Map<string, { top: string; topName: string }>();
  nestedCategories.forEach((top) => {
    const tid = String(top._id);
    catInfo.set(tid, { top: tid, topName: top.name });
    (top.subcategories || []).forEach((sub) => {
      catInfo.set(String(sub._id), { top: tid, topName: top.name });
    });
  });


  const items = products.map((p: any) => {
    const cat = p.category ? catInfo.get(String(p.category)) : undefined;
    return {
      _id: String(p._id),
      name: p.name,
      price: p.price,
      images: p.images?.slice(0, 1) ?? [],
      unit: p.unit,
      discount: p.discount || 0,
      badge: p.badge || "",
      shortDescription: p.shortDescription || stripHtml(p.description || "").slice(0, 110),
      ratings: p.ratings || 0,
      category: cat ? { _id: cat.top, name: cat.topName } : null,
      topCategoryId: cat ? cat.top : null,
    };
  });

  const categories = nestedCategories.map((c) => ({
    _id: String(c._id),
    name: c.name,
  }));

  // SEO: ItemList → Product rich results for every bake on the board.
  // GSC merchant-listing completeness: same complete offer as the
  // product pages — final sale, free on-site pickup.
  const RETURN_POLICY = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "AU",
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
  };
  const SHIPPING = {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "AUD" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "AU" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    },
  };

  const jsonLd = items.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "The Board — All Products",
        numberOfItems: items.length,
        itemListElement: items.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: p.name,
            description: p.shortDescription || undefined,
            image: p.images[0] || undefined,
            brand: { "@type": "Brand", name: BUSINESS_NAME },
            url: `${siteUrl}/product/${p._id}`,
            offers: {
              "@type": "Offer",
              price: (p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price).toFixed(2),
              priceCurrency: "AUD",
              availability: "https://schema.org/InStock",
              hasMerchantReturnPolicy: RETURN_POLICY,
              shippingDetails: SHIPPING,
              availableDeliveryMethod: "https://schema.org/OnSitePickup",
            },
          },
        })),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <Shop products={items} categories={categories} />

      <ShopFaqs />
      <ShopContact />
    </>
  );
}
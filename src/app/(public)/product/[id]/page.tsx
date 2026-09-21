import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductDetail from "@/components/product/ProductDetail";
import { stripHtml } from "@/lib/format";
import { SITE_URL as siteUrl, BUSINESS_NAME } from "@/lib/site";
import "./product.css";

/* PHASE 4 — ISR: every product page is prerendered at build time and
   served from the cache. Freshness is on-demand, not eventual:
   - admin create/update/delete call revalidatePath(`/product/${id}`)
   - reviews (post/edit/delete) call revalidatePath(`/product/${id}`)
   The hourly revalidate is only a safety net (e.g. direct DB edits).
   dynamicParams=true (default) means brand-new products still render
   on first request, then cache. */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    await dbConnect();
    const products = await Product.find({}).select("_id").lean();
    return products.map((p: any) => ({ id: String(p._id) }));
  } catch {
    /* building on a machine without DB access: render on demand instead */
    return [];
  }
}

/* the full field set the DETAIL page itself renders */
const FIELDS =
  "name price images unit discount badge shortDescription description ingredients nutrition options ratings salesCount reviews category";

/* PAYLOAD DIET (Phase 3): related products render as ProductCards —
   one image + a ~110-char blurb. */
const CARD_FIELDS = "name price images unit discount badge shortDescription description ratings";

const trimForCard = (p: any) => ({
  _id: String(p._id),
  name: p.name,
  price: p.price,
  images: p.images?.slice(0, 1) ?? [],
  unit: p.unit,
  discount: p.discount ?? 0,
  badge: p.badge ?? "",
  ratings: p.ratings ?? 0,
  shortDescription:
    p.shortDescription || stripHtml(p.description || "").slice(0, 110),
});

/* QUERY DEDUP (Phase 3): generateMetadata and the page share one query */
const getProduct = cache(async (id: string) => {
  await dbConnect();
  return Product.findById(id).select(FIELDS).populate("category", "name").lean();
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product: any = await getProduct(id);

  if (!product) return { title: "Product Not Found" };

  const description =
    product.shortDescription ||
    (product.description ? stripHtml(product.description).slice(0, 150) : "") ||
    "Delicious freshly baked item from Ayoob Bakery, Melbourne.";

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title: `${product.name} | Ayoob Bakery Melbourne`,
      description,
      images: product.images?.length ? [product.images[0]] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const product: any = await getProduct(id);

  if (!product) notFound();

  /* related: same aisle first, topped up with the best sellers */
  const catId = product.category?._id;
  let related: any[] = await Product.find({
    category: catId,
    _id: { $ne: id },
  })
    .select(CARD_FIELDS)
    .limit(8)
    .lean();

  if (related.length < 8) {
    const exclude = [id, ...related.map((r: any) => r._id)];
    const more = await Product.find({ _id: { $nin: exclude } })
      .select(CARD_FIELDS)
      .sort({ salesCount: -1, ratings: -1 })
      .limit(8 - related.length)
      .lean();
    related = [...related, ...more];
  }

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = related.map(trimForCard);

  /* ---------- SEO: Product + Breadcrumb rich results ---------- */
  const eff =
    serializedProduct.discount > 0
      ? serializedProduct.price * (1 - serializedProduct.discount / 100)
      : serializedProduct.price;
  const reviewCount = serializedProduct.reviews?.length || 0;

  /* SEO-4 guards: Google requires 1+ image and a non-empty description
     for a valid Product — imageless/description-less products were
     emitting image: [] and description: "" (validator failures). */
  const productImages = serializedProduct.images?.length
    ? serializedProduct.images
    : [`${siteUrl}/images/og-image.jpg`];

  const productDescription =
    serializedProduct.shortDescription ||
    stripHtml(serializedProduct.description || "") ||
    "Freshly baked at Ayoob Bakery Melbourne, Dandenong North.";

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: serializedProduct.name,
    description: productDescription,
    image: productImages,
    category: serializedProduct.category?.name,
    brand: { "@type": "Brand", name: BUSINESS_NAME },
    url: `${siteUrl}/product/${id}`,
    offers: {
      "@type": "Offer",
      price: eff.toFixed(2),
      priceCurrency: "AUD",
      /* deliberate: no stock-tracking exists; everything is baked
         daily and sold-out lines reset at opening — InStock is the
         honest default for this business */
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/product/${id}`,
      /* GSC merchant-listing completeness — honest values for a
         counter-pickup bakery: food is final sale, pickup is free */
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "AU",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "AUD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "AU" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        },
      },
      availableDeliveryMethod: "https://schema.org/OnSitePickup",
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: serializedProduct.ratings?.toFixed?.(1) ?? String(serializedProduct.ratings ?? 0),
            reviewCount,
          },
        }
      : {}),
  };

  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "The Board", item: `${siteUrl}/products` },
      {
        "@type": "ListItem",
        position: 3,
        name: serializedProduct.category?.name || "Products",
        item: `${siteUrl}/categories`,
      },
      { "@type": "ListItem", position: 4, name: serializedProduct.name, item: `${siteUrl}/product/${id}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
      <ProductDetail product={serializedProduct} related={serializedRelated} />
    </>
  );
}
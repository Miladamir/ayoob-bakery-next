const raw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

/** trailing slashes stripped so canonicals can never double-slash */
export const SITE_URL = raw.replace(/\/+$/, "");

/* ============================================================
   SEO-1 — NAP (Name, Address, Phone): ONE source of truth.
   Local ranking depends on your name/address/phone being
   IDENTICAL everywhere — on-page, in schema, and on your Google
   Business Profile. When any of this changes again, change it
   HERE, nowhere else.
============================================================ */
export const BUSINESS_NAME = "Ayoob Bakery Melbourne";

export const SHOP_ADDRESS = "4 Stevenson Ave, Dandenong North VIC 3175, Australia";

/** Where the illustrated map (and every "Get directions" button) points. */
export const MAPS_URL =
  "https://maps.google.com/?q=4+Stevenson+Ave,+Dandenong+North+VIC+3175,+Australia";

export const PHONE_TEL = "+61473621594";      // E.164 — tel: links + schema
export const PHONE_DISPLAY = "0473 621 594";  // how humans read it
export const PHONE_HREF = `tel:${PHONE_TEL}`;

/* Social profile URLs — feed schema sameAs. These are the links you
   provided; if you ever get cleaner profile-page URLs
   (instagram.com/<handle>, facebook.com/<page>), swap them here only. */
export const SOCIAL_PROFILES = [
  "https://www.instagram.com/p/DdREvNEk5oI/",
  "https://www.facebook.com/share/1BUTJ7evcn/",
];
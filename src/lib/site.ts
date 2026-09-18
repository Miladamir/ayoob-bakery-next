const raw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

/** trailing slashes stripped so canonicals can never double-slash */
export const SITE_URL = raw.replace(/\/+$/, "");

/** The shopfront address — ONE source of truth for every wayfinding
    surface (map link, contact page, footer, structured data). */
export const SHOP_ADDRESS = "4 Stevenson Ave, Dandenong North VIC 3175, Australia";

/** Where the illustrated map (and every "Get directions" button) points. */
export const MAPS_URL =
  "https://maps.google.com/?q=4+Stevenson+Ave,+Dandenong+North+VIC+3175,+Australia";
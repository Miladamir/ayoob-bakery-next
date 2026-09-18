/**
 * Font Awesome — loaded ONLY by the pages that still render `fa-*`
 * icons: /admin/**, /admin/login, /blogs, /blog/[id], /profile and
 * the error page.
 *
 * Phase 5 removed it from the root layout — every redesigned page
 * (home, products, categories, cart, search, product, wishlist,
 * about, contact, login, signup) uses Lucide only and now starts
 * paint without that render-blocking stylesheet.
 *
 * `precedence` makes React 19 hoist this into <head> and dedupe it
 * if it ever renders more than once.
 */
export default function FontAwesome() {
  return (
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      precedence="font-awesome"
    />
  );
}
import type { Metadata } from "next";
import "@/styles/site-effects.css";
import "./auth.css";
import Cursor from "@/components/effects/Cursor";
import Grain from "@/components/effects/Grain";
import SmoothScroll from "@/components/effects/SmoothScroll";
import RevealObserver from "@/components/effects/RevealObserver";

/* Account pages hold no search value — keep them out of the index. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip" href="#authform">Skip to the form</a>

      {/* the site's effect layer — cursor, grain, smooth scroll, reveal */}
      <Cursor />
      <Grain />
      <SmoothScroll />
      <RevealObserver />

      {children}
    </>
  );
}
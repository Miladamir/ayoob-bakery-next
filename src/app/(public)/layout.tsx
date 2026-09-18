import "@/styles/site-effects.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Cursor from "@/components/effects/Cursor";
import Grain from "@/components/effects/Grain";
import SmoothScroll from "@/components/effects/SmoothScroll";
import RevealObserver from "@/components/effects/RevealObserver";
import AnimationGovernor from "@/components/effects/AnimationGovernor";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      {/* site-wide effect layer */}
      <Cursor />
      <Grain />
      <SmoothScroll />
      <RevealObserver />
      <AnimationGovernor />

      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
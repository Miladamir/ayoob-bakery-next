import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import HoursCard from "./HoursCard";
import MapCard from "@/components/ui/MapCard";
import { MAPS_URL, SHOP_ADDRESS } from "@/lib/site";

export default function ContactSection() {
  return (
    <section id="contact" className="sec sec--tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <p className="kicker" data-reveal>
              <span className="k-no">04</span>
              <span className="k-rule" />
              <span>Contact</span>
            </p>
            <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
              Follow the smell <em>to the counter.</em>
            </h2>
          </div>
          <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
            Questions, catering, big orders — ring the counter, email us, or come
            stand in the good-smelling queue.
          </p>
        </header>

        <div className="contact-grid">
          <div data-reveal data-autopause>
            <MapCard />
            <p className="map-note">
              <MapPin />
              Street parking out front — the smell finds you before the signage does.
            </p>

            <div style={{ marginTop: "1.8rem" }}>
              <div className="contact-row">
                <span className="cr-ico"><MapPin /></span>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  {SHOP_ADDRESS}
                </a>
              </div>
              <div className="contact-row">
                <span className="cr-ico"><Phone /></span>
                <a href="tel:+61473621594">0473 621 594</a>
              </div>
              <div className="contact-row">
                <span className="cr-ico"><Mail /></span>
                <a href="mailto:hello@ayoobbakery.com.au">hello@ayoobbakery.com.au</a>
              </div>
            </div>

            <div className="contact-ctas">
              <a className="btn btn-primary" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                Get directions <ArrowUpRight />
              </a>
              <a className="btn btn-ghost" href="mailto:hello@ayoobbakery.com.au">
                Email us
              </a>
            </div>
          </div>

          <div data-reveal style={{ "--d": ".12s" } as React.CSSProperties}>
            <HoursCard />
            <p className="map-note" style={{ marginTop: "1.1rem" }}>
              <Clock />
              The board usually thins out late afternoon — the early bird gets the croissant.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import HoursCard from "./HoursCard";
import MapCard from "@/components/ui/MapCard";

const MAPS_URL = "https://maps.google.com/?q=312+Lygon+Street+Brunswick+Melbourne";

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
              Follow the smell down <em>Lygon Street.</em>
            </h2>
          </div>
          <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
            Questions, catering, big orders — ring the counter, email us, or come
            stand in the good-smelling queue.
          </p>
        </header>

        <div className="contact-grid">
          {/* PHASE 10 data-autopause: the map's route + pin pause while
              this block is off-screen (it contains no entrance animations,
              only data-reveal transitions — which are unaffected). */}
          <div data-reveal data-autopause>
            <MapCard />
            <p className="map-note">
              <MapPin />
              Tram 19 to stop 22, or a short wander from Brunswick station.
            </p>

            <div style={{ marginTop: "1.8rem" }}>
              <div className="contact-row">
                <span className="cr-ico"><MapPin /></span>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  312 Lygon Street, Brunswick VIC 3056
                </a>
              </div>
              <div className="contact-row">
                <span className="cr-ico"><Phone /></span>
                <a href="tel:+61393872196">(03) 9387 2196</a>
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
              The board usually thins out after 2 pm — the early bird gets the croissant.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
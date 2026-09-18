import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import HoursCard from "@/components/home/HoursCard";

const MAPS_URL = "https://maps.google.com/?q=312+Lygon+Street+Brunswick+Melbourne";

export default function ShopContact() {
  return (
    <section id="visit" className="sec">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <p className="kicker" data-reveal>
              <span className="k-no">02</span>
              <span className="k-rule" />
              <span>Questions?</span>
            </p>
            <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
              Talk to <em>the counter.</em>
            </h2>
          </div>
          <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
            Phone beats email, email beats carrier pigeon. Either way, we answer fast.
          </p>
        </header>

        <div className="visit-grid">
          <div data-reveal>
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

            <div className="visit-ctas">
              <a className="btn btn-primary" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                Get directions <ArrowUpRight />
              </a>
              <a className="btn btn-ghost" href="tel:+61393872196">Call the counter</a>
            </div>
          </div>

          <div data-reveal style={{ "--d": ".12s" } as React.CSSProperties}>
            <HoursCard />
            <p className="map-note">
              <Clock />
              The board usually thins out after 2 pm — the early bird gets the croissant.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
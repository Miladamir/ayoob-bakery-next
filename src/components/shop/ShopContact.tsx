import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import HoursCard from "@/components/home/HoursCard";
import { MAPS_URL, SHOP_ADDRESS, PHONE_HREF, PHONE_DISPLAY } from "@/lib/site";

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
                {SHOP_ADDRESS}
              </a>
            </div>
            <div className="contact-row">
              <span className="cr-ico"><Phone /></span>
              <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
            </div>
            <div className="contact-row">
              <span className="cr-ico"><Mail /></span>
              <a href="mailto:sales@ayoobbakerymelbourne.com.au">sales@ayoobbakerymelbourne.com.au</a>
            </div>

            <div className="visit-ctas">
              <a className="btn btn-primary" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                Get directions <ArrowUpRight />
              </a>
              <a className="btn btn-ghost" href={PHONE_HREF}>Call the counter</a>
            </div>
          </div>

          <div data-reveal style={{ "--d": ".12s" } as React.CSSProperties}>
            <HoursCard />
            <p className="map-note">
              <Clock />
              The board usually thins out after 4 pm — the early bird gets the croissant.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
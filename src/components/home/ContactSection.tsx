import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import HoursCard from "./HoursCard";

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
          <div data-reveal>
            <div className="map-card">
              <svg
                className="map-svg"
                viewBox="0 0 560 400"
                role="img"
                aria-label="Illustrated map — Ayoob Bakery, 312 Lygon Street Brunswick"
              >
                <rect width="560" height="400" rx="20" fill="#EFE6D2" />
                <g stroke="#26180E" opacity=".1" strokeWidth="16" fill="none" strokeLinecap="round">
                  <path d="M150 -10 L166 410" />
                  <path d="M310 -10 L296 410" />
                  <path d="M-10 190 H570" />
                  <path d="M-10 330 H570" strokeWidth="10" />
                </g>
                <g stroke="#26180E" opacity=".22" strokeWidth="1.5" fill="none" strokeDasharray="10 12">
                  <path d="M150 -10 L166 410" />
                  <path d="M310 -10 L296 410" />
                  <path d="M-10 190 H570" />
                  <path d="M-10 330 H570" />
                </g>
                <rect x="360" y="222" width="150" height="86" rx="12" fill="#7C8B4F" opacity=".2" />
                <text x="435" y="270" className="map-label" textAnchor="middle">PARK</text>
                <path
                  className="route"
                  d="M545 415 C480 350 460 320 402 262 S318 200 302 186"
                  fill="none" stroke="#C4551E" strokeWidth="3"
                  strokeDasharray="7 9" strokeLinecap="round"
                />
                <rect x="404" y="246" width="14" height="14" rx="3" fill="#FFFDF6" stroke="#26180E" strokeWidth="2" />
                <text x="427" y="258" className="map-label">STOP 22</text>
                <text x="322" y="62" className="map-label" transform="rotate(-2 322 62)">LYGON ST</text>
                <text x="96" y="122" className="map-label" transform="rotate(3 96 122)">SYDNEY RD</text>
                <text x="96" y="178" className="map-label">BRUNSWICK RD</text>
                <g transform="translate(296 176)">
                  <circle className="pin-ring" r="20" fill="none" stroke="#C4551E" strokeWidth="2" />
                  <circle r="11" fill="#C4551E" stroke="#FFFDF6" strokeWidth="3" />
                  <circle r="3.5" fill="#FFFDF6" />
                </g>
                <g transform="translate(296 108)">
                  <rect x="-92" y="-22" width="184" height="40" rx="10" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
                  <text y="4" textAnchor="middle" className="map-chip-t">AYOOB BAKERY</text>
                </g>
                <text x="296" y="152" className="map-sub" textAnchor="middle">312 Lygon St</text>
                <g transform="translate(516 46)" stroke="#26180E" fill="none" strokeWidth="2">
                  <circle r="16" />
                  <path d="M0 -9 l5 12 -5 -3 -5 3z" fill="#26180E" stroke="none" />
                </g>
              </svg>
            </div>
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
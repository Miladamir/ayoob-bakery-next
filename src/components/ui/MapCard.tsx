import { MAPS_URL } from "@/lib/site";

/**
 * Illustrated map of the shopfront — now a tappable link to Google Maps.
 * Layered (Phase 10/10.5): static base painted once, route sweep alone in
 * its overlay, pin as composited HTML divs.
 */
export default function MapCard() {
  return (
    <a
      className="map-card"
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open our location in Google Maps — 4 Stevenson Ave, Dandenong North VIC 3175"
    >
      {/* the static base — painted once */}
      <svg
        className="map-svg"
        viewBox="0 0 560 400"
        role="img"
        aria-label="Illustrated map — Ayoob Bakery, 4 Stevenson Ave, Dandenong North"
      >
        <rect width="560" height="400" rx="20" fill="#EFE6D2" />
        <g stroke="#26180E" opacity=".1" strokeWidth="16" fill="none" strokeLinecap="round">
          <path d="M150 -10 L166 410" /><path d="M310 -10 L296 410" />
          <path d="M-10 190 H570" /><path d="M-10 330 H570" strokeWidth="10" />
        </g>
        <g stroke="#26180E" opacity=".22" strokeWidth="1.5" fill="none" strokeDasharray="10 12">
          <path d="M150 -10 L166 410" /><path d="M310 -10 L296 410" />
          <path d="M-10 190 H570" /><path d="M-10 330 H570" />
        </g>
        <rect x="360" y="222" width="150" height="86" rx="12" fill="#7C8B4F" opacity=".2" />
        <text x="435" y="270" className="map-label" textAnchor="middle">PARK</text>
        <rect x="404" y="246" width="14" height="14" rx="3" fill="#FFFDF6" stroke="#26180E" strokeWidth="2" />
        <text x="427" y="258" className="map-label">BUS STOP</text>
        <text x="322" y="62" className="map-label" transform="rotate(-2 322 62)">STEVENSON AVE</text>
        <g transform="translate(296 108)">
          <rect x="-92" y="-22" width="184" height="40" rx="10" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
          <text y="4" textAnchor="middle" className="map-chip-t">AYOOB BAKERY</text>
        </g>
        <text x="296" y="152" className="map-sub" textAnchor="middle">4 Stevenson Ave</text>
        <g transform="translate(516 46)" stroke="#26180E" fill="none" strokeWidth="2">
          <circle r="16" />
          <path d="M0 -9 l5 12 -5 -3 -5 3z" fill="#26180E" stroke="none" />
        </g>
      </svg>

      {/* the route sweep — alone in its overlay */}
      <svg className="map-live" viewBox="0 0 560 400" aria-hidden="true">
        <path
          className="route"
          d="M545 415 C480 350 460 320 402 262 S318 200 302 186"
          fill="none" stroke="#C4551E" strokeWidth="3"
          strokeDasharray="7 9" strokeLinecap="round"
        />
      </svg>

      {/* the pin — HTML, composited */}
      <span className="map-pin" aria-hidden="true">
        <span className="map-pin-ring" />
        <span className="map-pin-dot" />
        <span className="map-pin-core" />
      </span>
    </a>
  );
}
/**
 * Illustrated map of the shopfront — PHASE 10 SPLIT EDITION.
 *
 * SVG content changes invalidate the ENTIRE svg element, so with the
 * animated route + pin inside the base map, two tiny shapes forced a
 * full 560×400 repaint on the main thread every single frame (the
 * "−5fps near the map"). The animation now lives in a separate,
 * mostly-transparent overlay SVG (.map-live, promoted in
 * site-effects.css) — its per-frame paint is a fraction of the area,
 * and the rich base map (streets, park, labels, compass) paints once
 * and never again. Visually identical: same viewBox, same paths,
 * stacked absolutely.
 */
export default function MapCard() {
  return (
    <div className="map-card">
      {/* the static base — painted once */}
      <svg
        className="map-svg"
        viewBox="0 0 560 400"
        role="img"
        aria-label="Illustrated map — Ayoob Bakery, 312 Lygon Street Brunswick"
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
        <text x="427" y="258" className="map-label">STOP 22</text>
        <text x="322" y="62" className="map-label" transform="rotate(-2 322 62)">LYGON ST</text>
        <text x="96" y="122" className="map-label" transform="rotate(3 96 122)">SYDNEY RD</text>
        <text x="96" y="178" className="map-label">BRUNSWICK RD</text>
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

      {/* the animated overlay — route sweep + pinging pin only */}
      <svg className="map-live" viewBox="0 0 560 400" aria-hidden="true">
        <path
          className="route"
          d="M545 415 C480 350 460 320 402 262 S318 200 302 186"
          fill="none" stroke="#C4551E" strokeWidth="3"
          strokeDasharray="7 9" strokeLinecap="round"
        />
        <g transform="translate(296 176)">
          <circle className="pin-ring" r="20" fill="none" stroke="#C4551E" strokeWidth="2" />
          <circle r="11" fill="#C4551E" stroke="#FFFDF6" strokeWidth="3" />
          <circle r="3.5" fill="#FFFDF6" />
        </g>
      </svg>
    </div>
  );
}
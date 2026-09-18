/**
 * Hidden illustration library for the categories page.
 * Hand-drawn bake symbols + the wrap-paper patterns the aisle
 * cards are dressed in. Decorative only (aria-hidden).
 * Patterns are assigned to real categories by index in page.tsx.
 */
export default function PaperPatterns() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <symbol id="i-boule" viewBox="0 0 120 120">
          <path d="M18 82 C18 48 38 30 60 30 C82 30 102 48 102 82 Z" fill="#E7A23B" stroke="#26180E" strokeWidth="3" strokeLinejoin="round" />
          <path d="M46 46 q7 13 0 28 M60 40 q8 17 0 36 M74 46 q-7 13 0 28" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".75" />
          <circle cx="34" cy="56" r="2.4" fill="#FFFDF6" opacity=".9" /><circle cx="44" cy="40" r="2" fill="#FFFDF6" opacity=".9" />
          <circle cx="80" cy="42" r="2.4" fill="#FFFDF6" opacity=".9" /><circle cx="92" cy="58" r="2" fill="#FFFDF6" opacity=".9" />
        </symbol>

        <symbol id="i-naan" viewBox="0 0 120 120">
          <path d="M60 16 C88 20 104 44 100 68 C96 92 80 104 60 104 C40 104 24 92 20 68 C16 44 32 20 60 16 Z" fill="#F3DFB0" stroke="#26180E" strokeWidth="3" />
          <ellipse cx="44" cy="42" rx="6" ry="4" fill="#D8A45E" /><ellipse cx="76" cy="66" rx="5" ry="3.5" fill="#D8A45E" /><ellipse cx="54" cy="80" rx="4" ry="3" fill="#D8A45E" />
          <g fill="#26180E" opacity=".55">
            <circle cx="40" cy="58" r="1.6" /><circle cx="50" cy="54" r="1.6" /><circle cx="60" cy="58" r="1.6" /><circle cx="70" cy="54" r="1.6" />
            <circle cx="46" cy="70" r="1.6" /><circle cx="58" cy="74" r="1.6" /><circle cx="68" cy="68" r="1.6" /><circle cx="76" cy="76" r="1.6" />
          </g>
        </symbol>

        <symbol id="i-baguette" viewBox="0 0 120 120">
          <g transform="rotate(-32 60 60)">
            <rect x="12" y="42" width="96" height="36" rx="18" fill="#E7A23B" stroke="#26180E" strokeWidth="3" />
            <path d="M34 48 c6 8 6 16 0 24 M52 46 c6 10 6 18 0 26 M70 46 c6 10 6 18 0 26 M88 48 c6 8 6 16 0 24" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".75" />
          </g>
        </symbol>

        <symbol id="i-rye" viewBox="0 0 120 120">
          <ellipse cx="60" cy="66" rx="41" ry="27" fill="#B9854C" stroke="#26180E" strokeWidth="3" />
          <path d="M26 62 C50 56 72 56 94 62" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".65" />
          <circle cx="40" cy="74" r="2" fill="#FFFDF6" opacity=".85" /><circle cx="56" cy="78" r="2" fill="#FFFDF6" opacity=".85" />
          <circle cx="72" cy="74" r="2" fill="#FFFDF6" opacity=".85" /><circle cx="84" cy="66" r="2" fill="#FFFDF6" opacity=".85" />
        </symbol>

        <symbol id="i-croissant" viewBox="0 0 120 120">
          <g stroke="#26180E" strokeWidth="3" fill="#E7A23B">
            <ellipse cx="27" cy="79" rx="9" ry="13" transform="rotate(-64 27 79)" />
            <ellipse cx="93" cy="79" rx="9" ry="13" transform="rotate(64 93 79)" />
            <ellipse cx="37" cy="66" rx="14" ry="20" transform="rotate(-38 37 66)" />
            <ellipse cx="83" cy="66" rx="14" ry="20" transform="rotate(38 83 66)" />
            <ellipse cx="60" cy="58" rx="19" ry="27" />
          </g>
          <path d="M50 40 q8 -6 18 -2" fill="none" stroke="#FFFDF6" strokeWidth="3" strokeLinecap="round" opacity=".8" />
          <circle cx="22" cy="100" r="2.2" fill="#26180E" /><circle cx="98" cy="102" r="2.6" fill="#26180E" /><circle cx="86" cy="106" r="1.8" fill="#26180E" />
        </symbol>

        <symbol id="i-donut" viewBox="0 0 120 120">
          <circle cx="60" cy="64" r="38" fill="#F3DFB0" stroke="#26180E" strokeWidth="3" />
          <path d="M42 46 C48 34 74 36 78 50 C80 60 68 64 58 62 C48 60 38 56 42 46 Z" fill="#C4551E" stroke="#26180E" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="46" cy="76" r="2" fill="#FFFDF6" opacity=".95" /><circle cx="64" cy="80" r="2" fill="#FFFDF6" opacity=".95" />
          <circle cx="76" cy="72" r="2" fill="#FFFDF6" opacity=".95" /><circle cx="56" cy="88" r="2" fill="#FFFDF6" opacity=".95" />
        </symbol>

        <symbol id="i-baklava" viewBox="0 0 120 120">
          <path d="M60 20 L98 62 L60 104 L22 62 Z" fill="#E7A23B" stroke="#26180E" strokeWidth="3" strokeLinejoin="round" />
          <path d="M36 47 H84 M30 62 H90 M36 77 H84" stroke="#26180E" strokeWidth="2.5" opacity=".45" />
          <path d="M44 34 l8 -4 M70 33 l7 5" stroke="#FFFDF6" strokeWidth="3" strokeLinecap="round" opacity=".8" />
          <circle cx="54" cy="60" r="2.2" fill="#7C8B4F" /><circle cx="64" cy="66" r="2.2" fill="#7C8B4F" />
          <circle cx="58" cy="54" r="1.8" fill="#7C8B4F" /><circle cx="67" cy="58" r="1.8" fill="#7C8B4F" />
        </symbol>

        <symbol id="i-scroll" viewBox="0 0 120 120">
          <circle cx="60" cy="62" r="36" fill="#E7A23B" stroke="#26180E" strokeWidth="3" />
          <path d="M60 62 a8 8 0 0 1 8 8 a16 16 0 0 1 -16 16 a24 24 0 0 1 24 -24 a30 30 0 0 1 -30 30" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="53" cy="50" r="1.8" fill="#26180E" opacity=".55" /><circle cx="66" cy="58" r="1.8" fill="#26180E" opacity=".55" />
        </symbol>

        <symbol id="i-bolani" viewBox="0 0 120 120">
          <path d="M20 66 A40 40 0 0 1 100 66 Z" fill="#F3DFB0" stroke="#26180E" strokeWidth="3" strokeLinejoin="round" />
          <path d="M30 66 A30 30 0 0 1 90 66" fill="none" stroke="#26180E" strokeWidth="2.5" strokeDasharray="1 8" strokeLinecap="round" opacity=".7" />
          <circle cx="46" cy="54" r="3" fill="#C4551E" /><circle cx="60" cy="47" r="3" fill="#C4551E" /><circle cx="74" cy="54" r="3" fill="#C4551E" />
          <circle cx="52" cy="60" r="2" fill="#C4551E" opacity=".75" /><circle cx="68" cy="60" r="2" fill="#C4551E" opacity=".75" />
        </symbol>

        <symbol id="i-pie" viewBox="0 0 120 120">
          <path d="M18 72 A44 36 0 0 1 102 72 Z" fill="#F3DFB0" stroke="#26180E" strokeWidth="3" strokeLinejoin="round" />
          <path d="M46 58 l10 10 M64 54 l10 10" stroke="#26180E" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M32 50 a34 26 0 0 1 20 -16" fill="none" stroke="#FFFDF6" strokeWidth="3.5" strokeLinecap="round" opacity=".85" />
          <path d="M26 78 h68" stroke="#26180E" strokeWidth="2.5" strokeDasharray="1 8" strokeLinecap="round" opacity=".6" />
        </symbol>

        <symbol id="i-coffee" viewBox="0 0 120 120">
          <path d="M28 54 h50 v18 a22 22 0 0 1 -22 22 h-6 a22 22 0 0 1 -22 -22 Z" fill="#FFFDF6" stroke="#26180E" strokeWidth="3" />
          <path d="M78 60 h6 a11 11 0 0 1 0 22 h-6" fill="none" stroke="#26180E" strokeWidth="3" />
          <path d="M22 100 h62" stroke="#26180E" strokeWidth="3" strokeLinecap="round" />
          <path d="M44 46 c-5 -7 5 -11 0 -18 M62 46 c-5 -7 5 -11 0 -18" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".65" />
        </symbol>

        <symbol id="i-chai" viewBox="0 0 120 120">
          <path d="M30 56 h54 v12 a24 24 0 0 1 -24 24 h-6 a24 24 0 0 1 -24 -24 Z" fill="#FFFDF6" stroke="#26180E" strokeWidth="3" />
          <path d="M84 60 h5 a10 10 0 0 1 0 20 h-5" fill="none" stroke="#26180E" strokeWidth="3" />
          <path d="M24 100 h64" stroke="#26180E" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 48 c-5 -7 5 -11 0 -18 M66 48 c-5 -7 5 -11 0 -18" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".65" />
          <g stroke="#C4551E" strokeWidth="2.4" strokeLinecap="round">
            <path d="M40 70 l4 4 M44 70 l-4 4" /><path d="M62 76 l4 4 M66 76 l-4 4" />
          </g>
        </symbol>

        {/* wrap-paper patterns — assigned to real categories by index */}
        <pattern id="pat-boule" width="96" height="96" patternUnits="userSpaceOnUse">
          <use href="#i-boule" x="0" y="6" width="36" height="36" />
          <use href="#i-naan" x="56" y="0" width="30" height="30" />
          <use href="#i-baguette" x="26" y="48" width="42" height="42" />
          <use href="#i-rye" x="70" y="58" width="24" height="24" />
        </pattern>
        <pattern id="pat-sweet" width="96" height="96" patternUnits="userSpaceOnUse">
          <use href="#i-croissant" x="2" y="4" width="38" height="38" />
          <use href="#i-donut" x="58" y="2" width="32" height="32" />
          <use href="#i-baklava" x="30" y="48" width="38" height="38" />
          <use href="#i-scroll" x="72" y="58" width="22" height="22" />
        </pattern>
        <pattern id="pat-savoury" width="96" height="96" patternUnits="userSpaceOnUse">
          <use href="#i-bolani" x="4" y="6" width="40" height="40" />
          <use href="#i-pie" x="54" y="4" width="38" height="38" />
          <use href="#i-bolani" x="62" y="54" width="28" height="28" />
        </pattern>
        <pattern id="pat-pour" width="96" height="96" patternUnits="userSpaceOnUse">
          <use href="#i-coffee" x="2" y="2" width="40" height="40" />
          <use href="#i-chai" x="56" y="6" width="38" height="38" />
          <use href="#i-coffee" x="30" y="54" width="28" height="28" />
        </pattern>
        <pattern id="pat-scroll" width="96" height="96" patternUnits="userSpaceOnUse">
          <use href="#i-scroll" x="0" y="4" width="36" height="36" />
          <use href="#i-boule" x="58" y="8" width="34" height="34" />
          <use href="#i-donut" x="30" y="50" width="34" height="34" />
        </pattern>
      </defs>
    </svg>
  );
}
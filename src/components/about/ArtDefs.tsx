/** Hidden illustration library for the about page — decorative only. */
export default function ArtDefs() {
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

        <symbol id="i-scroll" viewBox="0 0 120 120">
          <circle cx="60" cy="62" r="36" fill="#E7A23B" stroke="#26180E" strokeWidth="3" />
          <path d="M60 62 a8 8 0 0 1 8 8 a16 16 0 0 1 -16 16 a24 24 0 0 1 24 -24 a30 30 0 0 1 -30 30" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="53" cy="50" r="1.8" fill="#26180E" opacity=".55" /><circle cx="66" cy="58" r="1.8" fill="#26180E" opacity=".55" />
        </symbol>

        <symbol id="i-donut" viewBox="0 0 120 120">
          <circle cx="60" cy="64" r="38" fill="#F3DFB0" stroke="#26180E" strokeWidth="3" />
          <path d="M42 46 C48 34 74 36 78 50 C80 60 68 64 58 62 C48 60 38 56 42 46 Z" fill="#C4551E" stroke="#26180E" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="46" cy="76" r="2" fill="#FFFDF6" opacity=".95" /><circle cx="64" cy="80" r="2" fill="#FFFDF6" opacity=".95" />
          <circle cx="76" cy="72" r="2" fill="#FFFDF6" opacity=".95" /><circle cx="56" cy="88" r="2" fill="#FFFDF6" opacity=".95" />
        </symbol>
      </defs>
    </svg>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, Wheat } from "lucide-react";

/* floating embers on the dark panel */
const EMBERS = [
  { left: "8%", top: "26%", size: 6, fd: "7s", fdel: "0s" },
  { left: "16%", top: "68%", size: 5, fd: "8.5s", fdel: "1.3s" },
  { right: "10%", top: "34%", size: 7, fd: "6.5s", fdel: ".7s" },
  { right: "20%", top: "78%", size: 5, fd: "9s", fdel: "2.1s" },
];

function SparkSvg() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
      />
    </svg>
  );
}

function StampSvg({ text }: { text: string }) {
  return (
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="56" fill="#FFFDF6" stroke="#26180E" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="#26180E" strokeWidth="1.5" strokeDasharray="2 6" opacity=".5" />
      <defs>
        <path id="authStampPath" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
      </defs>
      <text className="auth-stamp-text">
        <textPath href="#authStampPath">{text}</textPath>
      </text>
      <g stroke="#26180E" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M60 46v30" />
        <path d="M60 53l-8-8M60 53l8-8M60 63l-8-8M60 63l8-8M60 46q1-7 7-9" />
      </g>
    </svg>
  );
}

/* login: the deck oven — flames flicker, steam rises, light blinks */
function OvenArt() {
  return (
    <svg viewBox="0 0 260 240" aria-hidden="true">
      <g className="steam" fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".45">
        <path className="s1" d="M96 34c-6-8 4-13 0-22" />
        <path className="s2" d="M128 30c-6-8 4-13 0-22" />
        <path className="s3" d="M160 34c-6-8 4-13 0-22" />
      </g>
      <rect x="30" y="44" width="200" height="146" rx="16" fill="#F7F1E5" stroke="#26180E" strokeWidth="4" />
      <path d="M30 82h200" stroke="#26180E" strokeWidth="4" />
      <g stroke="#26180E" strokeWidth="3" fill="#FFFDF6">
        <circle cx="52" cy="63" r="8" /><circle cx="80" cy="63" r="8" /><circle cx="108" cy="63" r="8" />
      </g>
      <g stroke="#26180E" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M52 63l3-4M80 63l-3-4M108 63l4 3" />
      </g>
      <circle className="on-light" cx="220" cy="63" r="6" fill="#C4551E" />
      <path d="M88 190v-44a42 42 0 0 1 84 0v44" fill="#33200F" stroke="#26180E" strokeWidth="4" />
      <ellipse cx="130" cy="172" rx="26" ry="9" fill="#E7A23B" opacity=".9" />
      <path className="fl fl1" d="M116 178c-3-10 5-15 3-25 9 6 12 15 9 25z" fill="#C4551E" />
      <path className="fl fl2" d="M133 180c-2-8 4-12 2-19 7 5 8 12 5 19z" fill="#E7A23B" />
      <path d="M104 190h52" stroke="#26180E" strokeWidth="4" strokeLinecap="round" />
      <path d="M48 190v16M212 190v16" stroke="#26180E" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/* signup: the kraft bag with a boule peeking out */
function BagArt() {
  return (
    <svg viewBox="0 0 200 232" aria-hidden="true">
      <defs>
        <clipPath id="authBagClip"><circle cx="60" cy="60" r="56" /></clipPath>
      </defs>
      <path d="M64 62 C64 12 136 12 136 62" fill="none" stroke="#26180E" strokeWidth="6" strokeLinecap="round" />
      <path d="M70 60 C70 22 130 22 130 60" fill="none" stroke="#C97E3F" strokeWidth="3" strokeLinecap="round" opacity=".5" />
      <g transform="translate(52 -6) scale(.8)">
        <g className="bag-peek">
          <g clipPath="url(#authBagClip)">
            <path d="M18 82 C18 48 38 30 60 30 C82 30 102 48 102 82 Z" fill="#E7A23B" />
            <path
              d="M46 46 q7 13 0 28 M60 40 q8 17 0 36 M74 46 q-7 13 0 28"
              fill="none" stroke="#26180E" strokeWidth="3" strokeLinecap="round" opacity=".75"
            />
          </g>
          <circle cx="60" cy="60" r="56" fill="none" stroke="#26180E" strokeWidth="4" />
        </g>
      </g>
      <path d="M44 60 L156 60 L166 198 Q167 210 154 210 L46 210 Q33 210 34 198 Z" fill="#C97E3F" stroke="#26180E" strokeWidth="4" strokeLinejoin="round" />
      <path d="M44 60 L156 60 L159 88 L41 88 Z" fill="#B06E33" stroke="#26180E" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M41 88 L159 88" stroke="#26180E" strokeWidth="2" strokeDasharray="2 6" opacity=".5" />
      <path d="M60 92 L57 204 M140 92 L143 204" stroke="#26180E" strokeWidth="2" opacity=".18" />
      <rect x="60" y="118" width="80" height="58" rx="9" fill="none" stroke="#26180E" strokeWidth="2.5" strokeDasharray="3 6" opacity=".85" />
      <text x="100" y="146" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fontSize="16" letterSpacing="3" fill="#26180E">AYOOB</text>
      <path d="M100 156v14M100 160l-5-5M100 160l5-5M100 166l-4-4M100 166l4-4" stroke="#26180E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function AuthShell({
  variant,
  children,
}: {
  variant: "login" | "signup";
  children: ReactNode;
}) {
  const isLogin = variant === "login";

  return (
    <div className="authpage">
      {/* ============ THE INK PANEL ============ */}
      <aside className="auth-aside">
        {EMBERS.map((em, i) => (
          <span
            key={i}
            className="fember"
            aria-hidden="true"
            style={{
              left: em.left, right: em.right, top: em.top,
              width: em.size, height: em.size,
              "--fd": em.fd, "--fdel": em.fdel,
            } as React.CSSProperties}
          />
        ))}

        <div className="aside-top">
          <Link href="/" className="brand" aria-label="Ayoob Bakery — home">
            <span className="brand-mark">
              <Image src="/images/logo.png" alt="Ayoob Bakery" width={46} height={46} priority />
            </span>
            <span className="brand-text">
              <b>AYOOB</b>
              <small>Bakery · Melbourne</small>
            </span>
          </Link>
          <span className="aside-chip"><Wheat /> est. 1996 · Brunswick</span>
        </div>

        <div className="aside-mid">
          <p className="kicker">
            <span className="k-rule" />
            <span>{isLogin ? "Welcome back · the counter remembers" : "Pull up a chair"}</span>
          </p>
          <h1 className="aside-h">
            {isLogin ? (
              <>Your usual is <em>waiting.</em></>
            ) : (
              <>Save a seat at <em>the counter.</em></>
            )}
          </h1>
          <p className="aside-p">
            {isLogin
              ? "Favourites held, crumbs card ticking, the usual order one tap away — sign in and pick up right where you left off."
              : "One account and the counter starts remembering — favourites wait for you, orders carry between visits, and every bake earns a crumb toward one on the house."}
          </p>

          <div className="aside-frame">
            {isLogin ? <OvenArt /> : <BagArt />}
            <p className="frame-cap">
              {isLogin ? (
                <>The deck oven — <b>bought secondhand in 1996, still perfect.</b></>
              ) : (
                <>Your first bag — <b>there&rsquo;s room in here for a usual.</b></>
              )}
            </p>
          </div>
        </div>

        <div className="aside-foot">
          <span>{isLogin ? "Hearts never expire · crumbs never expire" : "No spam · one email a week, tops"}</span>
          <Link href="/"><ArrowLeft /> back to the website</Link>
        </div>

        <span className="aside-stamp" aria-hidden="true">
          <StampSvg
            text={
              isLogin
                ? "AYOOB BAKERY · WELCOME BACK · BRUNSWICK · EST 1996 ·"
                : "AYOOB BAKERY · PULL UP A CHAIR · BRUNSWICK · EST 1996 ·"
            }
          />
        </span>
        <span className="aside-spark" aria-hidden="true"><SparkSvg /></span>
      </aside>

      {/* ============ THE FORM PANEL ============ */}
      <main className="auth-main">{children}</main>
    </div>
  );
}
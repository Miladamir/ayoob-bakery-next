"use client";

import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { ArrowUp, Check, Mail, Send, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { copyText } from "@/lib/clipboard";
import { scrollToTop } from "@/lib/scroll";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import Link from "next/link";

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

const SOCIALS: { icon: SocialIcon; label: string; handle: string }[] = [
  { icon: InstagramIcon, label: "Instagram", handle: "@ayoobbakery" },
  { icon: FacebookIcon, label: "Facebook", handle: "Ayoob Bakery Melbourne" },
];

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  /* PHASE 4 (B7): pages are cached now — the initial year is whatever the
     cache was built with, then corrected client-side after mount.
     suppressHydrationWarning guards the once-a-year midnight edge case. */
  const [year, setYear] = useState<number>(new Date().getFullYear());
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setErr("That email looks half-baked — mind checking it?");
      return;
    }
    setErr("");
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v }),
      });
      if (!res.ok) throw new Error("failed");
      setState("done");
      toast(Mail, "Welcome to the table", `The Sunday Crumb is on its way to ${v}.`);
    } catch {
      setState("idle");
      setErr("The oven hiccuped — please try again.");
    }
  };

  const onSocial = async (s: (typeof SOCIALS)[number]) => {
    const ok = await copyText(s.handle);
    if (ok) toast(Check, "Handle copied", `Find us as ${s.handle} — we reshare the good ones.`);
    else toast(X, "Copy failed", "Give it one more try.");
  };

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          {/* newsletter */}
          <div className="foot-news">
            <h3>The Sunday Crumb</h3>
            <p>
              One email a week — what&rsquo;s in the oven, what&rsquo;s nearly gone, and the
              occasional family recipe. No crumbs about it.
            </p>
            {state === "done" ? (
              <p className="news-ok">
                <Check />
                You&rsquo;re on the list — the first crumb lands this Sunday.
              </p>
            ) : (
              <>
                <form className="news-form" onSubmit={submit} noValidate>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    aria-label="Email address"
                  />
                  <button className="btn btn-primary" type="submit" disabled={state === "loading"}>
                    {state === "loading" ? "Joining…" : (
                      <>
                        Join <Send />
                      </>
                    )}
                  </button>
                </form>
                {err && <p className="news-err show">{err}</p>}
              </>
            )}
          </div>

          {/* visit */}
          <div>
            <p className="foot-k">Visit</p>
            <ul className="foot-list">
              <li>4 Stevenson Ave</li>
              <li>Dandenong North VIC 3175</li>
              <li>
                <a href="tel:+61473621594">0473 621 594</a>
              </li>
              <li>
                <a href="mailto:sales@ayoobbakerymelbourne.com.au">sales@ayoobbakerymelbourne.com.au</a>
              </li>
            </ul>
          </div>

                    {/* hours */}
          <div>
            <p className="foot-k">Hours</p>
            <ul className="foot-list">
              <li>Mon – Sat · 8 am – 6 pm</li>
              <li>Sunday · closed</li>
            </ul>
          </div>

          {/* SEO-3 — site navigation: the footer now links into the site,
              giving every page (including every product + post) a
              crawlable path to the main sections */}
          <div>
            <p className="foot-k">Explore</p>
            <ul className="foot-list">
              <li><Link href="/menu">Menu &amp; prices</Link></li>
              <li><Link href="/products">All products</Link></li>
              <li><Link href="/categories">Categories</Link></li>
              <li><Link href="/search">Search</Link></li>
              <li><Link href="/blogs">Journal</Link></li>
              <li><Link href="/about">Our story</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* follow */}
          <div>
            <p className="foot-k">Follow</p>
            <div className="socs">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    type="button"
                    className="soc"
                    onClick={() => onSocial(s)}
                  >
                    <Icon />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="foot-giant" aria-hidden="true">
          AYOOB BAKERY
        </p>

        <div className="foot-bottom">
          <span suppressHydrationWarning>&copy; {year} Ayoob Bakery Melbourne</span>
          <span>Made with flour, fire &amp; Melbourne mornings.</span>
          <button
            type="button"
            className="to-top"
            aria-label="Back to top"
            onClick={scrollToTop}
          >
            <ArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
}
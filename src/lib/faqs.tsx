import type { ReactNode } from "react";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/site";

/* ============================================================
   SEO-4 — FAQ CONTENT: single source of truth.
   The accordion components render these entries AND the
   FAQPage JSON-LD is generated from them, so the visible
   answers and the machine-readable answers can never drift.
   Phone numbers come from lib/site (the NAP block) — never
   hardcode them here.
============================================================ */

export interface FaqEntry {
  q: string;
  /** plain text — feeds BOTH the UI and the JSON-LD */
  a: string;
}

export const HOME_FAQS: FaqEntry[] = [
  {
    q: "What time does everything come out of the oven?",
    a: "The first bake lands before dawn and the counter opens at 8:00. Everything you see was made this morning — when a tray sells out, it’s gone until tomorrow.",
  },
  {
    q: "Can I order ahead or reserve bakes?",
    a: `Yes — ring the counter on ${PHONE_DISPLAY} and we’ll hold anything you like until closing. For big orders and event spreads, give us 48 hours’ notice.`,
  },
  {
    q: "Do you have vegan or gluten-free options?",
    a: "We have vegan options most days (ask about our coconut puff pastry made with plant-based butter), and several gluten-free cookies. All our pastries use traditional Afghan recipes with cardamom, pistachio, and coconut. Ask us: we know exactly what's in everything.",
  },
  {
    q: "Can I freeze the pastries?",
    a: "Please do. Our pastries freeze beautifully. Place them in an airtight container, then reheat in a 180°C oven for 5-7 minutes — they'll taste fresh-baked.",
  },
  {
    q: "Do you deliver?",
    a: "Not yet — pick-up only from 4 Stevenson Avenue, Dandenong North. The smell carries halfway down the street — you’ll find us.",
  },
  {
    q: "Do you cater events or office trays?",
    a: "We do — from meeting trays to full celebration spreads. Give us 48 hours and a rough headcount, and we’ll handle the rest.",
  },
  {
    q: "What’s the best thing on the board?",
    a: "Dangerous question. The diplomatic answer is our cardamom shortbread. The honest answer is whatever came out of the oven five minutes ago — but the coconut puff pastry has a cult following.",
  },
];

export const SHOP_FAQS: FaqEntry[] = [
  {
    q: "Can I reserve bakes for later today?",
    a: `Ring the counter before 5 pm on ${PHONE_DISPLAY} and we’ll hold anything on the board under your name. Reserved items wait until close — after that, the house rule is finders keepers.`,
  },
  {
    q: "Can I order online for pickup?",
    a: "Yes — fill your cart right here, check out, and we’ll have it wrapped and waiting at the counter. Pickup from 4 Stevenson Avenue, usually ready in about twenty minutes.",
  },
  {
    q: "Do you deliver?",
    a: "Same-morning delivery within about 8 km of Dandenong North, $6 flat, free over $50. Everything travels in paper, in insulated boxes, at bakery speed — which is to say, quickly.",
  },
  {
    q: "What about allergens?",
    a: "One kitchen, one oven: gluten, dairy, eggs and nuts are all in daily rotation. Full ingredient lists live at the counter and we love the question — ask before you order, not after.",
  },
];

/* Render an answer as React nodes, turning the NAP phone number
   into a tappable tel: link wherever it appears. */
export function renderFaqAnswer(text: string): ReactNode {
  const parts = text.split(PHONE_DISPLAY);
  if (parts.length === 1) return text;
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 ? <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a> : null}
    </span>
  ));
}

/** FAQPage JSON-LD built from the same entries the UI renders */
export function faqPageJsonLd(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}
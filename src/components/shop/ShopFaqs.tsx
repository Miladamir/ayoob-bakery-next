"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Can I reserve bakes for later today?",
    a: <>Ring the counter before 3 pm on <a href="tel:+61393872196">(03) 9387 2196</a> and we&rsquo;ll hold anything on the board under your name. Reserved items wait until close — after that, the house rule is finders keepers.</>,
  },
  {
    q: "Can I order online for pickup?",
    a: <>Yes — fill your cart right here, check out, and we&rsquo;ll have it wrapped and waiting at the counter. Pickup from 312 Lygon Street, usually ready in about twenty minutes.</>,
  },
  {
    q: "Do you deliver?",
    a: <>Same-morning delivery within about 8 km of Brunswick, $6 flat, free over $50. Everything travels in paper, in insulated boxes, at bakery speed — which is to say, quickly.</>,
  },
  {
    q: "What about allergens?",
    a: <>One kitchen, one oven: gluten, dairy, eggs and nuts are all in daily rotation. Full ingredient lists live at the counter and we love the question — ask before you order, not after.</>,
  },
];

export default function ShopFaqs() {
  const [open, setOpen] = useState(-1);

  return (
    <section id="faq" className="sec sec--tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <p className="kicker" data-reveal>
              <span className="k-no">01</span>
              <span className="k-rule" />
              <span>Good to know</span>
            </p>
            <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
              Before you <em>fill your boots.</em>
            </h2>
          </div>
          <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
            The short answers. For everything else, the counter knows.
          </p>
        </header>

        <div className="faq-grid">
          {FAQS.map((f, i) => (
            <div
              className={`faq-item${open === i ? " open" : ""}`}
              key={i}
              data-reveal
              style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
            >
              <button
                className="faq-head"
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <h3>{f.q}</h3>
                <span className="faq-chev" aria-hidden="true"><Plus /></span>
              </button>
              <div className="faq-body">
                <div><p>{f.a}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
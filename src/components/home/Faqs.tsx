"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { HOME_FAQS, faqPageJsonLd, renderFaqAnswer } from "@/lib/faqs";
import { PHONE_HREF, PHONE_DISPLAY } from "@/lib/site";

/* SEO-4: content lives in lib/faqs.tsx (single source for the UI and
   the FAQPage JSON-LD below). */
const faqLd = faqPageJsonLd(HOME_FAQS);

export default function Faqs() {
  const [open, setOpen] = useState(0); // first item open, like the template

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <section id="faqs" className="sec sec--dark">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <p className="kicker" data-reveal>
                <span className="k-no">04</span>
                <span className="k-rule" />
                <span>Good questions</span>
              </p>
              <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
                The things you <em>always ask.</em>
              </h2>
            </div>
            <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
              Freshness, diets, orders, freezing — if it&rsquo;s not on this list, ask
              at the counter. The counter knows everything.
            </p>
          </header>

          <div className="faq-list">
            {HOME_FAQS.map((f, i) => (
              <div
                className={`faq${open === i ? " open" : ""}`}
                key={i}
                data-reveal
                style={{ "--d": `${i * 0.06}s` } as React.CSSProperties}
              >
                <button
                  className="faq-q"
                  type="button"
                  id={`fq-${i}`}
                  aria-expanded={open === i}
                  aria-controls={`fa-${i}`}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  <span className="faq-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="faq-qtext">{f.q}</span>
                  <span className="faq-ico" aria-hidden="true">
                    <Plus />
                  </span>
                </button>
                <div className="faq-a" id={`fa-${i}`} role="region" aria-labelledby={`fq-${i}`}>
                  <div className="faq-a-in">
                    <p>{renderFaqAnswer(f.a)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="board-note" data-reveal>
            Still stuck? Ring the counter on{" "}
            <a href={PHONE_HREF}>{PHONE_DISPLAY}</a> — real humans, floury hands.
          </p>
        </div>
      </section>
    </>
  );
}
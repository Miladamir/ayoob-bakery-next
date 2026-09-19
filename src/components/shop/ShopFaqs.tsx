"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SHOP_FAQS, faqPageJsonLd, renderFaqAnswer } from "@/lib/faqs";

/* SEO-4: content lives in lib/faqs.tsx (single source for the UI and
   the FAQPage JSON-LD below). */
const faqLd = faqPageJsonLd(SHOP_FAQS);

export default function ShopFaqs() {
  const [open, setOpen] = useState(-1);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

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
            {SHOP_FAQS.map((f, i) => (
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
                  <div><p>{renderFaqAnswer(f.a)}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "What time does everything come out of the oven?",
    a: <>The first bake lands at 4 am and the counter opens at 6:30. Everything you see was made this morning — when a tray sells out, it&rsquo;s gone until tomorrow.</>,
  },
  {
    q: "Can I order ahead or reserve bakes?",
    a: <>Yes — ring the counter on <a href="tel:+61393872196">(03) 9387 2196</a> and we&rsquo;ll hold anything you like until closing. For big orders and event spreads, give us 48 hours&rsquo; notice.</>,
  },
  {
    q: "Do you have vegan or gluten-free options?",
    a: <>Always something rotating — vegan scrolls most days, a gluten-free slice on weekends, and our sourdough&rsquo;s 36-hour ferment makes it gentler for many people. Ask us: we know exactly what&rsquo;s in everything.</>,
  },
  {
    q: "Can I freeze the bread?",
    a: <>Please do. Slice it first, freeze whatever you won&rsquo;t eat in two days, then revive it in a hot oven for three minutes — it&rsquo;ll taste like it just came off the stone.</>,
  },
  {
    q: "Do you deliver?",
    a: <>Not yet — pick-up only from 312 Lygon Street. Between the 19 tram at stop 22 and the smell carrying halfway down Lygon, you&rsquo;ll find us.</>,
  },
  {
    q: "Do you cater events or office trays?",
    a: <>We do — from meeting trays to full celebration spreads. Give us 48 hours and a rough headcount, and we&rsquo;ll handle the rest.</>,
  },
  {
    q: "What’s the best thing on the board?",
    a: <>Dangerous question. The diplomatic answer is the sourdough. The honest answer is whatever came out of the oven five minutes ago.</>,
  },
];

export default function Faqs() {
  const [open, setOpen] = useState(0); // first item open, like the template

  return (
    <section id="faqs" className="sec sec--dark">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <p className="kicker" data-reveal>
              <span className="k-no">03</span>
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
          {FAQS.map((f, i) => (
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
                  <p>{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="board-note" data-reveal>
          Still stuck? Ring the counter on{" "}
          <a href="tel:+61393872196">(03) 9387 2196</a> — real humans, floury hands.
        </p>
      </div>
    </section>
  );
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

const REVIEWS = [
  {
    q: "The coconut puff pastry is unlike anything else in Melbourne. I drive past three bakeries to get here every week and regret nothing.",
    n: "Sarah M. — Dandenong",
  },
  {
    q: "Their cardamom shortbread with pistachio reminds me of my grandmother's baking in Kabul. The real deal, no shortcuts.",
    n: "Ahmed K. — Noble Park",
  },
  {
    q: "I ordered the braided sesame bread for a family gathering. It disappeared before dinner even started.",
    n: "Fatima R. — Springvale",
  },
  {
    q: "The cream horns are perfect — flaky, not greasy, with just the right amount of sweetness. Better than anything I had in Europe.",
    n: "James T. — Keysborough",
  },
  {
    q: "As someone who grew up eating Afghan pastries, this is the only place in Melbourne that gets it right. The khatai cookies are perfect.",
    n: "Zahra H. — Dandenong North",
  },
];

export default function Reviews() {
  const [idx, setIdx] = useState(0);
  const [out, setOut] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const rmRef = useRef(true);

  const restartBar = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (rmRef.current) {
      bar.style.animation = "none";
      bar.style.transform = "none"; /* full bar, settled (RM) */
      return;
    }
    bar.style.animation = "none";
    bar.style.transform = ""; /* back to the CSS scaleX(0) start */
    void bar.offsetWidth;
    bar.style.animation = "qbar 6.5s linear forwards";
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goRef = useRef<(dir: number) => void>(() => {});

  const play = useCallback(() => {
    stop();
    restartBar();
    if (rmRef.current) return;
    timerRef.current = window.setInterval(() => goRef.current(1), 6500);
  }, [stop, restartBar]);

  const go = useCallback(
    (dir: number) => {
      setOut(true);
      window.setTimeout(() => {
        setIdx((p) => (p + dir + REVIEWS.length) % REVIEWS.length);
        setOut(false);
      }, 430);
      play();
    },
    [play]
  );

  useEffect(() => {
    goRef.current = go;
  }, [go]);

  // mount: measure reduced motion + start the rotation
  useEffect(() => {
    rmRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    play();
    return stop;
  }, [play, stop]);

  const pause = () => {
    stop();
    if (barRef.current) barRef.current.style.animationPlayState = "paused";
  };

  return (
    <section id="reviews" className="sec">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <p className="kicker" data-reveal>
              <span className="k-no">03</span>
              <span className="k-rule" />
              <span>Word of mouth</span>
            </p>
            <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
              Melbourne, <em>in its own words.</em>
            </h2>
          </div>
          <p className="sec-note" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
            From the queue, the tram stop and the office kitchen — the nice things
            people say when the bread&rsquo;s still warm.
          </p>
        </header>

        <div className="rev-top" data-reveal>
          <div className="stars" aria-hidden="true">
            <Star />
            <Star />
            <Star />
            <Star />
            <Star />
          </div>
          <p className="rev-score">4.9 — from 900+ Melbourne mornings</p>
        </div>

        <div
          className="quote-box"
          data-reveal
          style={{ "--d": ".1s" } as React.CSSProperties}
          onMouseEnter={pause}
          onMouseLeave={play}
        >
          <blockquote className={`quote${out ? " out" : ""}`}>
            &ldquo;{REVIEWS[idx].q}&rdquo;
          </blockquote>
          <p className="quote-cite">
            <span>{REVIEWS[idx].n}</span>
            <span>
              <span>{String(idx + 1).padStart(2, "0")}</span> /{" "}
              {String(REVIEWS.length).padStart(2, "0")}
            </span>
          </p>
          <div className="quote-ctrl">
            <button className="q-btn" type="button" aria-label="Previous review" onClick={() => go(-1)}>
              <ArrowLeft />
            </button>
            <div className="q-progress">
              <span ref={barRef} />
            </div>
            <button className="q-btn" type="button" aria-label="Next review" onClick={() => go(1)}>
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
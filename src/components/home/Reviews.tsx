"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

const REVIEWS = [
  {
    q: "The sourdough here has ruined every other loaf in Melbourne for me. I drive past three bakeries to get here every Saturday and regret nothing.",
    n: "Priya M. — Keysborough",
  },
  {
    q: "The naan comes out warm, the bolani has a queue of regulars by 9 am, and the counter remembers your order by week two. That's an institution.",
    n: "Hamed R. — Dandenong North",
  },
  {
    q: "I sent a mixed dozen to the office. It did not survive the 9 am stand-up.",
    n: "Jess T. — Noble Park",
  },
  {
    q: "Cardamom scrolls on Friday are worth setting an alarm for. I've started calling them my weekly bonus.",
    n: "Marta K. — Springvale",
  },
  {
    q: "Proper baklava, proper espresso, and the kind of counter chat you can't get in a chain. Grew up on this baklava.",
    n: "Sam W. — Endeavour Hills",
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
              <span className="k-no">02</span>
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
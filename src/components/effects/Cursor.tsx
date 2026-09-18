"use client";

import { useEffect, useRef } from "react";

/** Custom ember dot + ring cursor — fine pointers only, exactly as the template. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const docEl = document.documentElement;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!dotRef.current || !ringRef.current) return;

    docEl.classList.add("has-cursor");

    let mx = -100, my = -100, rx = -100, ry = -100;
    let raf = 0;

    /* PHASE 5 — idle-skip: the loop keeps running, but when the mouse
       hasn't moved and the ring has caught up, ZERO style writes happen.
       Previously two fixed elements were re-styled ~60×/s forever,
       even with the cursor parked — continuous style invalidation on
       every page for nothing. (The first tick still writes the initial
       off-screen transforms, so startup visuals are unchanged.) */
    let lastMx = -101, lastMy = -101;
    let ringSettled = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      ringSettled = false;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      docEl.classList.toggle(
        "on-link",
        !!(t?.closest?.("a,button,.tab,.pc,.faq-q,input"))
      );
    };
    const down = () => docEl.classList.add("press");
    const up = () => docEl.classList.remove("press");
    const leave = () => docEl.classList.add("cur-hide");
    const enter = () => docEl.classList.remove("cur-hide");

    const tick = () => {
      if (mx !== lastMx || my !== lastMy) {
        lastMx = mx;
        lastMy = my;
        if (dotRef.current)
          dotRef.current.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      }
      if (!ringSettled) {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        if (ringRef.current)
          ringRef.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        /* within a tenth of a pixel — the eye can't tell, stop writing */
        if (Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1) ringSettled = true;
      }
      raf = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    docEl.addEventListener("mouseleave", leave);
    docEl.addEventListener("mouseenter", enter);
    raf = requestAnimationFrame(tick);

    return () => {
      docEl.classList.remove("has-cursor", "on-link", "press", "cur-hide");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
      docEl.removeEventListener("mouseleave", leave);
      docEl.removeEventListener("mouseenter", enter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="cDot" ref={dotRef} aria-hidden="true" />
      <div id="cRing" ref={ringRef} aria-hidden="true" />
    </>
  );
}
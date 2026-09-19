"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* ============================================================
   ROUTE PROGRESS BAR — top edge line for client-side navigations.

   Next.js doesn't reload the browser between pages, so a slow
   navigation gives zero feedback — links feel broken. This shows
   a 3px ember→honey line at the top during real navigations.

   How it works (App Router has no route events):
   - START:  capture-phase click on a qualifying internal <a>,
             a patched history.pushState (programmatic navs:
             router.push after admin saves, etc.), or popstate.
   - FINISH: the usePathname effect firing (navigation completed),
             or the failsafe below.
   - The 150ms show-delay means instant (prefetched) navigations
     never flash the bar — it only appears when there's actual
     waiting, which is the only time it's wanted.

   Skipped: external origins, target=_blank, modifier clicks,
   downloads, mailto:/tel:, hash links, same-URL links.
============================================================ */

const SHOW_DELAY = 150; // ms — instant navs never show the bar
const FAILSAFE_MS = 6000; // never leave a stuck bar
const DONE_MS = 450; // finish animation time before reset

function isInternalNav(a: HTMLAnchorElement): boolean {
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download")) return false;
  const rel = (a.getAttribute("rel") || "").split(/\s+/);
  if (rel.includes("external")) return false;
  const href = a.getAttribute("href") || "";
  if (href.length < 2) return false;
  if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
  let url: URL;
  try {
    url = new URL(a.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  /* same path+search → not a navigation (hash links, self links) */
  if (url.pathname === location.pathname && url.search === location.search) return false;
  return true;
}

export default function RouteProgressBar() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const s = useRef({ started: false, shown: false, showTimer: 0, failTimer: 0, doneTimer: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const st = s.current;
    const clearAll = () => {
      window.clearTimeout(st.showTimer);
      window.clearTimeout(st.failTimer);
      window.clearTimeout(st.doneTimer);
    };
    const reset = () => {
      st.started = false;
      st.shown = false;
      barRef.current?.classList.remove("on", "done");
    };

    function finish() {
      if (!st.started) return;
      clearAll();
      if (!st.shown) {
        /* navigation was instant — the bar never appeared */
        reset();
        return;
      }
      barRef.current?.classList.add("done");
      st.doneTimer = window.setTimeout(reset, DONE_MS);
    }

    function start() {
      if (st.started) return;
      window.clearTimeout(st.doneTimer); // a new nav cancels a fading bar
      st.started = true;
      st.shown = false;
      barRef.current?.classList.remove("done");
      window.clearTimeout(st.showTimer);
      st.showTimer = window.setTimeout(() => {
        st.shown = true;
        barRef.current?.classList.add("on");
      }, SHOW_DELAY);
      window.clearTimeout(st.failTimer);
      st.failTimer = window.setTimeout(finish, FAILSAFE_MS);
    }

    /* 1 · link clicks */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (isInternalNav(a)) start();
    };
    document.addEventListener("click", onClick, true);

    /* 2 · programmatic navigations (router.push, admin form saves) */
    /* typed as a rest-parameter function so the spread call below is
       legal (the bound signature has fixed params — TS 2556) */
    const nativePush: (...args: any[]) => void = history.pushState.bind(history);
    history.pushState = function (this: History, ...args: any[]) {
      const ret = nativePush(...args);
      try {
        const u = new URL(String(args[2]), location.href);
        if (u.pathname !== location.pathname || u.search !== location.search) start();
      } catch {
        start();
      }
      return ret;
    } as typeof history.pushState;

    /* 3 · back / forward */
    const onPop = () => start();
    window.addEventListener("popstate", onPop);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      history.pushState = nativePush;
      clearAll();
      reset();
    };
  }, []);

  /* navigation completed → finish */
  useEffect(() => {
    const st = s.current;
    if (st.started) {
      window.clearTimeout(st.showTimer);
      window.clearTimeout(st.failTimer);
      if (!st.shown) {
        st.started = false;
        return;
      }
      barRef.current?.classList.add("done");
      window.clearTimeout(st.doneTimer);
      st.doneTimer = window.setTimeout(() => {
        st.started = false;
        st.shown = false;
        barRef.current?.classList.remove("on", "done");
      }, DONE_MS);
    }
  }, [pathname]);

  return (
    <div className="rpb" ref={barRef} aria-hidden="true">
      <span className="rpb-bar" />
    </div>
  );
}
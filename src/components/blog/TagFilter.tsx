"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface TagFilterProps {
  /** unique tag strings present on the posts */
  tags: string[];
  /** total unfiltered post count */
  total: number;
}

/**
 * SEO-3 — blog tag filtering at /blogs?tag=<slug>.
 * Server renders ALL posts + the tag links (crawlable hrefs, so tags
 * are discoverable), then this component applies client-side
 * filtering and keeps the URL shareable. Deep-linked tags are read
 * on mount (the page is cache-served, same pattern as Shop).
 */
export default function TagFilter({ tags, total }: TagFilterProps) {
  const [tag, setTag] = useState<string | null>(null);

  /* read ?tag= on mount */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tag");
    if (t) setTag(t);
  }, []);

  const filter = (t: string | null) => {
    setTag(t);
    const url = t ? `/blogs?tag=${t}` : "/blogs";
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="tagbar" role="group" aria-label="Filter posts by tag">
      <button
        type="button"
        className={`tchip${tag === null ? " on" : ""}`}
        aria-pressed={tag === null}
        onClick={() => filter(null)}
      >
        All posts <span className="cnt">{total}</span>
      </button>
      {tags.map((t) => (
        <button
          key={t}
          type="button"
          className={`tchip${tag === t ? " on" : ""}`}
          aria-pressed={tag === t}
          onClick={() => filter(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
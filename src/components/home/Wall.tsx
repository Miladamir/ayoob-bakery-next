import Link from "next/link";
import Image from "next/image";
import { Wheat } from "lucide-react";
import { money } from "@/lib/format";

/* ============================================================
   THE WALL — the morning's bake as a photo gallery.
   Ported from the approved template: masonry tiles with wide /
   tall accents (grid-auto-flow:dense packs the gaps), ink
   borders, hover lift + image zoom, gradient veil + name/price.
   Tiles are plain Links — a server component, no client JS.

   The parent (homepage loader) ranks + caps what lands here.
============================================================ */

export interface WallProduct {
  _id: string;
  name: string;
  price: number;
  image: string | null;
  unit: string;
  discount: number;
}

interface WallProps {
  products: WallProduct[];
  /** total bakes in the catalog — may exceed what's on the wall */
  total: number;
}

/* the template's masonry accent pattern — wide (2 cols) / tall
   (3 rows) — indexed by tile position, cycled if ever needed */
const SPANS = [
  "wt--wide", "", "", "wt--tall", "", "wt--wide",
  "", "wt--tall", "", "", "", "wt--wide",
  "", "wt--tall", "", "",
];

const UNITS: Record<string, string> = { kg: "/ kg", lb: "/ lb" };

export default function Wall({ products, total }: WallProps) {
  const shown = products.length;

  /* empty catalog edge case — keep the section presentable */
  if (!shown) {
    return (
      <p className="wall-note" data-reveal>
        The ovens are warming up — the board is being stocked. Check back after
        the morning bake.
      </p>
    );
  }

  const capped = shown < total;

  return (
    <>
      <div className="wall" data-reveal>
        {products.map((p, i) => {
          const span = SPANS[i % SPANS.length];
          const wide = span === "wt--wide";
          const eff = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
          return (
            <Link
              key={p._id}
              href={`/product/${p._id}`}
              className={`wt${span ? ` ${span}` : ""}`}
              aria-label={`View ${p.name}`}
            >
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes={wide ? "(max-width: 640px) 92vw, 480px" : "(max-width: 640px) 46vw, 250px"}
                  className="wt-img"
                />
              ) : (
                <span className="wt-noimg" aria-hidden="true">
                  <Wheat />
                </span>
              )}
              <span className="wt-veil" aria-hidden="true" />
              <span className="wt-name">
                <b>{p.name}</b>
                <span>
                  {money(eff)}
                  {UNITS[p.unit] && <i>{UNITS[p.unit]}</i>}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <p className="wall-note" data-reveal>
        {capped ? (
          <>
            Showing {shown} of {total} bakes —{" "}
            <Link href="/products">browse the whole board</Link>.
          </>
        ) : (
          <>
            {shown} {shown === 1 ? "bake" : "bakes"} this morning · everything wrapped
            in paper.
          </>
        )}
      </p>
    </>
  );
}
import Link from "next/link";
import { ArrowRight, Wheat } from "lucide-react";
import "./not-found.css";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <main className="nf">
      <div className="nf-in">
        <span className="nf-kicker">
          <Wheat /> Ayoob Bakery Melbourne
        </span>

        <h1 className="nf-code">
          4<em>0</em>4
        </h1>

        <p className="nf-title">This one came out of the oven wrong.</p>

        <p className="nf-sub">
          The page you&rsquo;re after isn&rsquo;t on the board — it may have sold out,
          moved shelves, or never existed. The bread, however, is exactly where
          we left it.
        </p>

        <div className="nf-ctas">
          <Link className="btn btn-primary" href="/products">
            Browse the board <ArrowRight />
          </Link>
          <Link className="btn btn-ghost nf-ghost" href="/">
            Take me home
          </Link>
        </div>

        <p className="nf-foot">4 Stevenson Ave, Dandenong North · 0473 621 594</p>
      </div>
    </main>
  );
}
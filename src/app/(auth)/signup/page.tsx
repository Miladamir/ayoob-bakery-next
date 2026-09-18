"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Flame,
  Loader2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { useToast } from "@/context/ToastContext";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const { status } = useSession();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const submitted = useRef(false);

  /* already signed in? straight home */
  useEffect(() => {
    if (status === "authenticated" && !submitted.current) router.replace("/");
  }, [status, router]);

  const dest = (): string => {
    try {
      const cb = new URLSearchParams(window.location.search).get("callbackUrl");
      if (cb && cb.startsWith("/") && !cb.startsWith("//")) return cb;
    } catch {}
    return "/";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitted.current = true;
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = ((formData.get("name") as string) || "").trim();
    const email = ((formData.get("email") as string) || "").trim();
    const password = (formData.get("password") as string) || "";
    const confirmPassword = (formData.get("confirmPassword") as string) || "";

    /* friendly validation, in the counter's voice */
    if (name.length < 2) {
      setError("Tell us your name — the counter likes to know who it's shouting for.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email looks half-baked — mind checking it?");
      return;
    }
    if (password.length < 8) {
      setError("Passwords need at least 8 characters — make it a good one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don't match — mind checking the second one?");
      return;
    }

    setLoading(true);
    try {
      /* 1. create the user (password hashing happens in the model's pre-save hook) */
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        /* 2. automatically log them in */
        const signInResult = await signIn("credentials", { email, password, redirect: false });
        if (signInResult?.ok) {
          toast(Check, "Pull up a chair", `Welcome to the family, ${name.split(" ")[0]}.`);
          router.push(dest());
          router.refresh();
          return;
        }
        /* auto-login stumbled — the account exists, send them to sign in */
        setError("Account created — but auto sign-in stumbled. Please sign in.");
        window.setTimeout(() => router.push("/login"), 1400);
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(
        data.message === "User already exists"
          ? "That email's already on the list — try signing in instead."
          : "The oven hiccuped — please try again."
      );
    } catch {
      setError("Something went wrong — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const google = () => {
    submitted.current = true;
    signIn("google", { callbackUrl: dest() });
  };

  return (
    <AuthShell variant="signup">
      <div className="formcard" id="authform" data-reveal>
        <div className="fc-head">
          <p className="fc-k"><span className="k-rule" /><span>Create your account</span></p>
          <h2>Join the <em>family.</em></h2>
          <p className="fc-sub">Favourites that wait, orders that carry, crumbs that add up.</p>
        </div>

        {error && (
          <div className="auth-err" role="alert">
            <TriangleAlert /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name" name="name" type="text" autoComplete="name"
              placeholder="Ayoob Baker" required
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" autoComplete="email"
              placeholder="you@example.com" required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <span className="pw-wrap">
              <input
                id="password" name="password" type={showPw ? "text" : "password"}
                autoComplete="new-password" placeholder="At least 8 characters" required
              />
              <button
                type="button" className="pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword" name="confirmPassword" type={showPw ? "text" : "password"}
              autoComplete="new-password" placeholder="Once more, for the counter" required
            />
          </div>

          <button className="btn btn-primary btn-block auth-submit" type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin" /> : (<>Create account <ArrowRight /></>)}
          </button>
        </form>

        <div className="or"><span>or</span></div>

        <button className="btn btn-ghost btn-block" type="button" onClick={google}>
          <GoogleIcon /> Sign up with Google
        </button>

        <p className="auth-switch">
          Already have a seat? <Link href="/login">Sign in</Link>
        </p>

        <ul className="auth-trust">
          <li><ShieldCheck /> No spam — one email a week, tops</li>
          <li><Flame /> Every bake earns a crumb toward one on the house</li>
        </ul>
      </div>
    </AuthShell>
  );
}
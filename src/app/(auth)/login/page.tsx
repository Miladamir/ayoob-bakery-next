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
  Loader2,
  Phone,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { status } = useSession();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const submitted = useRef(false);

  /* already signed in? straight home — never fires after our own submit */
  useEffect(() => {
    if (status === "authenticated" && !submitted.current) router.replace("/");
  }, [status, router]);

  /* where to land after login (?callbackUrl= aware, same-origin paths only) */
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
    const email = ((formData.get("email") as string) || "").trim();
    const password = (formData.get("password") as string) || "";

    if (!email || !password) {
      setError("Both fields, please — the counter can't find you without them.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "That email and password don't match anything behind the counter — mind checking them?"
            : "Something went wrong at the counter — please try again."
        );
        setLoading(false);
        return;
      }
      toast(Check, "The kettle's on", "Welcome back — your favourites missed you.");
      router.push(dest());
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setLoading(false);
    }
  };

  const google = () => {
    submitted.current = true;
    signIn("google", { callbackUrl: dest() });
  };

  return (
    <AuthShell variant="login">
      <div className="formcard" id="authform" data-reveal>
        <div className="fc-head">
          <p className="fc-k"><span className="k-rule" /><span>Sign in</span></p>
          <h2>Back to the <em>board.</em></h2>
          <p className="fc-sub">Your favourites, orders and crumbs card — all where you left them.</p>
        </div>

        {error && (
          <div className="auth-err" role="alert">
            <TriangleAlert /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
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
                autoComplete="current-password" placeholder="••••••••" required
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

          <button className="btn btn-primary btn-block auth-submit" type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin" /> : (<>Sign in <ArrowRight /></>)}
          </button>
        </form>

        <div className="or"><span>or</span></div>

        <button className="btn btn-ghost btn-block" type="button" onClick={google}>
          <GoogleIcon /> Continue with Google
        </button>

        <p className="auth-switch">
          New here? <Link href="/signup">Create an account</Link>
        </p>

        <ul className="auth-trust">
          <li><ShieldCheck /> Your details stay between you and the counter</li>
          <li><Phone /> Forgot your password? Ring the counter — 0473 621 594</li>
        </ul>
      </div>
    </AuthShell>
  );
}
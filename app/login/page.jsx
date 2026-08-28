"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { Brand } from "@/components/brand";
import { useAuth } from "@/contexts/auth-context";
import { safeInternalPath } from "@/lib/navigation";

export default function LoginPage() {
  return <Suspense fallback={<main className="auth-page auth-loading"><div className="spinner" /></main>}><LoginForm /></Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const next = safeInternalPath(params.get("next"), "/dashboard");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      router.replace(next);
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not log in");
    }
    finally {
      setBusy(false);
    }
  }

  async function google(credential) {
    if (!credential)
      return;
    setBusy(true);
    try {
      await googleLogin(credential);
      toast.success("Welcome to PromptArc");
      router.replace(next);
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
    }
    finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-orbit" />
        <Brand />
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>Return to your <em>prompt library.</em></h1>
          <p>Pick up where you left off, track your creations, and discover what the community is building.</p>
        </div>
        <blockquote>“The right prompt doesn’t replace your thinking. It gives your thinking a better starting point.”</blockquote>
      </section>
      <section className="auth-form-wrap">
        <Link className="auth-home" href="/">← Back home</Link>
        <div className="auth-form-card">
          <div className="auth-mobile-brand"><Brand /></div>
          <span className="auth-icon"><Sparkles /></span>
          <h2>Log in to PromptArc</h2>
          <p>Use your email and password to continue.</p>
          <form onSubmit={submit} className="form-stack">
            <label>Email address
              <div className="input-with-icon"><Mail /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div>
            </label>
            <label>
              <span>Password</span>
              <div className="input-with-icon">
                <LockKeyhole />
                <input type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
                <button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff /> : <Eye />}</button>
              </div>
            </label>
            <button className="button button-wide" disabled={busy} type="submit">{busy ? "Signing in…" : <>Log in <ArrowRight /></>}</button>
          </form>
          <div className="or-divider"><span>or continue with</span></div>
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
              <div className="google-button"><GoogleLogin onSuccess={(result) => google(result.credential)} onError={() => toast.error("Google sign-in failed")} shape="pill" width="320" /></div>
            </GoogleOAuthProvider>
          ) : (
            <button className="button button-ghost button-wide" type="button" onClick={() => toast.info("Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google login")}>Google sign-in (configure key)</button>
          )}
          <p className="auth-switch">New to PromptArc? <Link href={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}

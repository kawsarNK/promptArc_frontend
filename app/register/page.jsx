"use client";

/* eslint-disable jsx-a11y/alt-text -- lucide-react's Image is an icon component, not an HTML image. */
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, Image, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { Brand } from "@/components/brand";
import { useAuth } from "@/contexts/auth-context";
import { safeInternalPath } from "@/lib/navigation";

export default function RegisterPage() {
  return <Suspense fallback={<main className="auth-page auth-loading"><div className="spinner" /></main>}><RegisterForm /></Suspense>;
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", photoURL: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const valid = form.password.length >= 8 && form.password.length <= 128 && /[A-Z]/.test(form.password) && /\d/.test(form.password);
  const next = safeInternalPath(params.get("next"), "/dashboard");

  async function submit(event) {
    event.preventDefault();
    if (!valid) {
      toast.error("Use 8-128 characters with one uppercase letter and one number");
      return;
    }
    setBusy(true);
    try {
      await register(form);
      toast.success("Your PromptArc account is ready");
      router.replace(next);
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create account");
    }
    finally {
      setBusy(false);
    }
  }

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <main className="auth-page">
      <section className="auth-visual register-visual">
        <div className="auth-orbit" />
        <Brand />
        <div>
          <span className="eyebrow">Join the community</span>
          <h1>Your best AI work <em>starts here.</em></h1>
          <p>Save useful prompts, learn from expert creators, and publish your own systems when you are ready.</p>
          <ul><li><Check />Bookmark an unlimited prompt library</li><li><Check />Publish three prompts on the free plan</li><li><Check />Build a trusted creator profile</li></ul>
        </div>
      </section>
      <section className="auth-form-wrap">
        <Link className="auth-home" href="/">← Back home</Link>
        <div className="auth-form-card register-card">
          <div className="auth-mobile-brand"><Brand /></div>
          <span className="auth-icon"><Sparkles /></span>
          <h2>Create your account</h2>
          <p>Free to join. No credit card required.</p>
          <form onSubmit={submit} className="form-stack">
            <label>Full name<div className="input-with-icon"><UserRound /><input maxLength={80} value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" required /></div></label>
            <label>Email address<div className="input-with-icon"><Mail /><input type="email" maxLength={320} value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" required /></div></label>
            <label>Profile photo URL <small>optional</small><div className="input-with-icon"><Image /><input type="url" maxLength={1000} value={form.photoURL} onChange={set("photoURL")} placeholder="https://…" /></div></label>
            <label>Password
              <div className="input-with-icon"><LockKeyhole /><input type={show ? "text" : "password"} minLength={8} maxLength={128} value={form.password} onChange={set("password")} placeholder="At least 8 characters" autoComplete="new-password" required /><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff /> : <Eye />}</button></div>
              <span className={valid ? "password-hint valid" : "password-hint"}>{valid && <Check />} 8-128 characters, uppercase, and number</span>
            </label>
            <button className="button button-wide" disabled={busy} type="submit">{busy ? "Creating account…" : <>Join PromptArc <ArrowRight /></>}</button>
          </form>
          <p className="terms">By creating an account, you agree to the Terms and Privacy Policy.</p>
          <p className="auth-switch">Already a member? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></p>
        </div>
      </section>
    </main>
  );
}

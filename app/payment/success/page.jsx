"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Crown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { safeInternalPath } from "@/lib/navigation";

export default function PaymentSuccessPage() {
  return <Suspense fallback={<main className="payment-page shell"><div className="spinner" /></main>}><Success /></Suspense>;
}

function Success() {
  const router = useRouter();
  const params = useSearchParams();
  const { token, user, loading, updateUser } = useAuth();
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  const sessionId = params.get("session_id") || "";
  const next = safeInternalPath(params.get("next"), "/prompts");

  useEffect(() => {
    if (loading || state !== "loading")
      return;
    if (!user || !token) {
      const returnPath = `/payment/success?session_id=${encodeURIComponent(sessionId)}&next=${encodeURIComponent(next)}`;
      router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
      return;
    }
    if (!sessionId) {
      setMessage("The Stripe session identifier is missing.");
      setState("error");
      return;
    }
    let active = true;
    api.verifyPayment(sessionId, token)
      .then(({ user: updated }) => {
        if (!active)
          return;
        updateUser(updated);
        setState("success");
      })
      .catch((error) => {
        if (!active)
          return;
        setMessage(error instanceof Error ? error.message : "Payment verification failed");
        setState("error");
      });
    return () => {
      active = false;
    };
  }, [loading, user, token, sessionId, next, router, updateUser, state]);

  useEffect(() => {
    if (state !== "success")
      return undefined;
    const timer = window.setTimeout(() => router.replace(next), 2500);
    return () => window.clearTimeout(timer);
  }, [state, next, router]);

  return (
    <div className="site-page">
      <Navbar />
      <main className="payment-page shell">
        <div className="payment-success-card">
          {state === "loading" ? <><div className="spinner" /><p>Verifying your payment…</p></> : state === "success" ? (
            <><span className="success-icon"><Check /></span><Crown /><span className="eyebrow">Payment complete</span><h1>Welcome to Premium</h1><p>Your account now has permanent access to every premium prompt. Redirecting you back…</p><Link className="button" href={next}>Continue exploring <ArrowRight /></Link></>
          ) : (
            <><h1>We could not verify the payment</h1><p>{message || "Please return to checkout or contact support if you were charged."}</p><Link className="button" href={`/payment?next=${encodeURIComponent(next)}`}>Return to checkout</Link></>
          )}
        </div>
      </main>
    </div>
  );
}

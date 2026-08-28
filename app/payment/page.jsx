"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Crown, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { safeInternalPath } from "@/lib/navigation";

export default function PaymentPage() {
    return <Suspense fallback={<main className="payment-page shell"><div className="spinner" /></main>}><Payment /></Suspense>;
}

function Payment() {
    const router = useRouter();
    const params = useSearchParams();
    const { user, token, loading } = useAuth();
    const [busy, setBusy] = useState(false);
    const next = safeInternalPath(params.get("next"), "/dashboard");

    useEffect(() => {
        if (!loading && !user) {
            const paymentPath = `/payment?next=${encodeURIComponent(next)}`;
            router.replace(`/login?next=${encodeURIComponent(paymentPath)}`);
        }
    }, [loading, user, router, next]);

    if (loading || !user || !token) {
        return <div className="site-page"><Navbar /><main className="payment-page shell"><div className="detail-loading"><div className="spinner" /><p>Preparing secure checkout…</p></div></main></div>;
    }

    if (user.subscription === "premium") {
        return (
            <div className="site-page">
                <Navbar />
                <main className="payment-page shell">
                    <div className="payment-success-card"><Crown /><span className="eyebrow">Already unlocked</span><h1>You are a Premium member</h1><p>Every premium prompt is available to you.</p><Link className="button" href={next}>Continue <ArrowRight /></Link></div>
                </main>
            </div>
        );
    }

    async function checkout() {
        setBusy(true);
        try {
            const { url } = await api.createCheckout(token, next);
            window.location.assign(url);
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not start checkout");
            setBusy(false);
        }
    }

    return (
        <div className="site-page">
            <Navbar />
            <main className="payment-page shell">
                <Link className="back-link" href={next}><ArrowLeft /> Back</Link>
                <div className="payment-grid">
                    <section>
                        <span className="eyebrow">PromptArc Premium</span>
                        <h1>One payment.<br /><em>Every premium prompt.</em></h1>
                        <p>Upgrade once and keep permanent marketplace-wide access to premium content.</p>
                        <div className="benefit-list"><span><Check />Unlock every private prompt</span><span><Check />Copy, bookmark, and review premium prompts</span><span><Check />Support high-quality creators</span><span><Check />Keep access without a subscription</span></div>
                        <div className="secure-note"><ShieldCheck /><div><strong>Secure Stripe checkout</strong><span>Your payment details never touch our server.</span></div></div>
                    </section>
                    <aside className="price-card">
                        <div className="premium-emblem"><Crown /></div><span>Lifetime Premium access</span>
                        <div className="price"><sup>$</sup><strong>5</strong><small>one time</small></div>
                        <div className="price-divider" />
                        <p>Instant access after successful payment. No recurring fee.</p>
                        <button className="button button-wide" onClick={checkout} disabled={busy}>{busy ? "Opening secure checkout…" : <>Unlock Premium <ArrowRight /></>}</button>
                        <small><LockKeyhole /> Payment secured by Stripe</small><div className="stripe-placeholder">VISA · Mastercard · AMEX</div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

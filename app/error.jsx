"use client";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
export default function ErrorPage({ reset }) { return <main className="error-page"><AlertTriangle /><span>Something went off prompt</span><h1>We couldn’t load this page.</h1><p>Try the request again. If the problem continues, return to the marketplace.</p><div><button className="button" onClick={reset}><RefreshCw /> Try again</button><Link className="button button-ghost" href="/">Go home</Link></div></main>; }

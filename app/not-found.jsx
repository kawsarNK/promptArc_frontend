import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
export default function NotFound() { return <main className="not-found"><div className="not-found-number">4<span><Sparkles /></span>4</div><h1>This prompt wandered off.</h1><p>The page you requested does not exist or may have moved.</p><Link className="button" href="/"><ArrowLeft /> Return home</Link></main>; }

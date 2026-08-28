import Link from "next/link";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import { Brand } from "./brand";
export function Footer() {
    return (<footer className="site-footer">
      <div className="footer-grid shell">
        <div className="footer-intro">
          <Brand />
          <p>Thoughtfully made prompts for people doing meaningful work with AI.</p>
        </div>
        <div><h3>Marketplace</h3><Link href="/prompts">All prompts</Link><Link href="/prompts?sort=popular">Trending</Link><Link href="/dashboard/add-prompt">Become a creator</Link></div>
        <div><h3>Company</h3><Link href="/#why">Why PromptArc</Link><Link href="/#creators">Creators</Link><Link href="mailto:hello@promptarc.dev">Contact</Link></div>
        <div><h3>Follow</h3><a href="https://github.com" target="_blank" rel="noreferrer"><Github size={16}/> GitHub</a><a href="https://linkedin.com" target="_blank" rel="noreferrer"><Linkedin size={16}/> LinkedIn</a><a href="https://x.com" target="_blank" rel="noreferrer">𝕏 <span>X</span></a></div>
      </div>
      <div className="footer-bottom shell"><span>© 2026 PromptArc</span><span>Made for sharper thinking <ArrowUpRight size={14}/></span></div>
    </footer>);
}

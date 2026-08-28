"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  ChevronRight,
  Copy,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PromptCard } from "@/components/prompt-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

const categoryDefinitions = [
  { name: "Productivity", label: "Work & productivity", icon: WandSparkles, tone: "coral" },
  { name: "Research", label: "Research & thinking", icon: BrainCircuit, tone: "lime" },
  { name: "Design", label: "Design & creativity", icon: Layers3, tone: "blue" },
  { name: "Development", label: "Build & automate", icon: Zap, tone: "gold" },
  { name: "Marketing", label: "Brand & marketing", icon: Sparkles, tone: "plum" },
  { name: "Education", label: "Learn & teach", icon: Users, tone: "mint" },
];

const emptyStats = {
  totalUsers: 0,
  totalPrompts: 0,
  totalCopies: 0,
  totalBookmarks: 0,
  totalReviews: 0,
  averageRating: 0,
};

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [creators, setCreators] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.allSettled([
      api.featured(),
      api.topCreators(),
      api.recentReviews(),
      api.marketplaceStats(),
    ]).then(([promptsResult, creatorsResult, reviewsResult, statsResult]) => {
      if (!active)
        return;
      const failed = [promptsResult, creatorsResult, reviewsResult, statsResult].some((result) => result.status === "rejected");
      if (promptsResult.status === "fulfilled") {
        const livePrompts = promptsResult.value.prompts || [];
        setFeatured(livePrompts);
        setTrendingTags(randomTags(livePrompts));
      }
      if (creatorsResult.status === "fulfilled")
        setCreators(creatorsResult.value.creators || []);
      if (reviewsResult.status === "fulfilled")
        setReviews(reviewsResult.value.reviews || []);
      if (statsResult.status === "fulfilled") {
        setStats({ ...emptyStats, ...(statsResult.value.stats || {}) });
        setCategoryCounts(Object.fromEntries((statsResult.value.categories || []).map((item) => [item.name, item.count])));
      }
      if (failed)
        setError("Some live marketplace data could not be loaded. The page will not substitute demo records.");
    }).finally(() => {
      if (active)
        setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reload]);

  const spotlight = featured[0] || null;

  function search(event) {
    event.preventDefault();
    router.push(`/prompts${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
  }

  function openPrompt(prompt) {
    const path = `/prompts/${prompt._id || prompt.slug}`;
    router.push(!authLoading && !user ? `/login?next=${encodeURIComponent(path)}` : path);
  }

  return (
    <div className="site-page">
      <Navbar />
      <main>
        <section className="hero-section">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-grid shell">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="hero-kicker"><span><Sparkles size={14} /></span> Curated by people who use AI for real work</div>
              <h1>Stop guessing.<br />Start with a <em>better prompt.</em></h1>
              <p>Discover practical, field-tested prompts for the work that matters — from strategy and research to design, code, and growth.</p>
              <form className="hero-search" onSubmit={search}>
                <Search size={20} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What do you want AI to help you do?" aria-label="Search prompts" />
                <button type="submit">Explore <ArrowRight size={17} /></button>
              </form>
              <div className="trending-tags">
                <span>Trending</span>
                {trendingTags.length
                  ? trendingTags.map((tag) => <button key={tag} onClick={() => router.push(`/prompts?search=${encodeURIComponent(tag)}`)}>#{tag.replaceAll(" ", "")}</button>)
                  : <small>{loading ? "Loading live tags…" : "Tags appear after prompts are approved"}</small>}
              </div>
              <div className="hero-proof">
                <div className="stacked-avatars"><span>PA</span><span>AI</span><span>+</span></div>
                <div>
                  <strong>{stats.totalUsers ? `${formatCompact(stats.totalUsers)} thoughtful builders` : "A growing builder community"}</strong>
                  <small><Star size={12} fill="currentColor" /> {stats.totalReviews ? `${Number(stats.averageRating).toFixed(1)} average from ${formatCompact(stats.totalReviews)} reviews` : "Ratings are calculated from real reviews"}</small>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="hero-showcase"
              initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.75, delay: 0.15 }}
            >
              <div className="showcase-label">{spotlight ? "Prompt of the week" : "Marketplace spotlight"} <BadgeCheck size={16} /></div>
              <div className="showcase-window">
                <div className="window-bar"><span /><span /><span /><small>{spotlight ? `${spotlight.aiTool.toLowerCase()}-prompt.arc` : "your-next-prompt.arc"}</small></div>
                {spotlight ? (
                  <>
                    <div className="window-body">
                      <div className="code-line"><b>CREATOR</b><span>{spotlight.creator?.name || "PromptArc creator"}</span></div>
                      <div className="code-line"><b>TOOL</b><span>{spotlight.aiTool}</span></div>
                      <div className="prompt-preview">{spotlight.description}</div>
                      <div className="output-list">
                        <small>BEST FOR</small>
                        {(spotlight.tags || []).slice(0, 4).map((tag) => <span key={tag}><Check />{tag}</span>)}
                      </div>
                    </div>
                    <div className="window-footer">
                      <span><Star size={14} fill="currentColor" /> {Number(spotlight.averageRating || 0).toFixed(1)} · {spotlight.reviewCount || 0} reviews</span>
                      <button onClick={() => openPrompt(spotlight)}><Copy size={15} /> View details</button>
                    </div>
                  </>
                ) : (
                  <div className="showcase-empty">
                    <Sparkles />
                    <h3>{loading ? "Loading approved prompts…" : "The first approved prompt will appear here"}</h3>
                    <p>Marketplace cards are loaded only from the database.</p>
                    {!loading && <Link className="button button-sm" href={user ? "/dashboard/add-prompt" : "/register"}>Publish a prompt</Link>}
                  </div>
                )}
              </div>
              <div className="float-chip chip-one"><span>{formatCompact(stats.totalPrompts)}</span> approved prompts</div>
              <div className="float-chip chip-two"><Users size={16} /> {formatCompact(stats.totalCopies)} copies</div>
            </motion.div>
          </div>

          <div className="hero-marquee" aria-label="Supported AI tools">
            <div className="hero-marquee-track">
              <span>CHATGPT <b>✦</b> CLAUDE <b>✦</b> GEMINI <b>✦</b> MIDJOURNEY <b>✦</b> PERPLEXITY <b>✦</b> DALL·E <b>✦</b></span>
              <span aria-hidden="true">CHATGPT <b>✦</b> CLAUDE <b>✦</b> GEMINI <b>✦</b> MIDJOURNEY <b>✦</b> PERPLEXITY <b>✦</b> DALL·E <b>✦</b></span>
            </div>
          </div>
        </section>

        {error && (
          <div className="data-warning shell" role="status">
            <span>{error}</span>
            <button onClick={() => setReload((value) => value + 1)}>Retry</button>
          </div>
        )}

        <section className="section shell" id="featured">
          <SectionHeading
            eyebrow="Editor’s selection"
            title="Prompts worth keeping close"
            copy="Every featured prompt is reviewed for clarity, usefulness, and repeatable results."
            action={<Link className="arrow-link" href="/prompts">Explore all <ArrowRight /></Link>}
          />
          {loading ? <CardSkeleton /> : featured.length ? (
            <div className="prompt-grid">{featured.map((prompt, index) => <PromptCard key={prompt._id} prompt={prompt} index={index} />)}</div>
          ) : (
            <EmptySection title="No approved prompts yet" copy="Approved prompts from MongoDB will appear here automatically." actionHref={user ? "/dashboard/add-prompt" : "/register"} actionLabel="Submit the first prompt" />
          )}
        </section>

        <section className="category-band">
          <div className="section shell">
            <SectionHeading eyebrow="Find your starting point" title="Made for the way you work" />
            <div className="category-grid">
              {categoryDefinitions.map(({ name, label, icon: Icon, tone }, index) => (
                <Reveal key={name} delay={index * 0.05}>
                  <Link className={`category-card ${tone}`} href={`/prompts?category=${encodeURIComponent(name)}`}>
                    <span className="category-icon"><Icon /></span>
                    <div><h3>{label}</h3><p>{categoryCounts[name] || 0} prompts</p></div>
                    <ChevronRight />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section shell" id="why">
          <div className="why-grid">
            <Reveal className="why-statement">
              <span className="eyebrow">Why PromptArc</span>
              <h2>A marketplace with a <em>quality filter.</em></h2>
              <p>PromptArc is built around useful outcomes, not prompt volume. Each listing explains the purpose, the right context, and how to adapt it.</p>
              <Link className="button button-dark" href="/register">Create your free account <ArrowRight /></Link>
            </Reveal>
            <div className="why-features">
              <Reveal className="feature-row"><span>01</span><div><ShieldCheck /><h3>Moderated for quality</h3><p>Every submitted prompt is reviewed before it reaches the marketplace.</p></div></Reveal>
              <Reveal className="feature-row"><span>02</span><div><BrainCircuit /><h3>Context, not just copy</h3><p>Usage notes and difficulty labels help you get the intended result faster.</p></div></Reveal>
              <Reveal className="feature-row"><span>03</span><div><Users /><h3>Built by practitioners</h3><p>Learn from creators who test prompts in design, product, research, and code.</p></div></Reveal>
            </div>
          </div>
        </section>

        <section className="dark-section" id="creators">
          <div className="section shell">
            <SectionHeading eyebrow="Community leaders" title="Meet the minds behind the prompts" copy="Open a creator profile to see their approved work and live performance totals." />
            {creators.length ? (
              <div className="creator-grid">
                {creators.slice(0, 4).map((creator, index) => (
                  <Reveal className="creator-card" key={creator._id} delay={index * 0.06}>
                    <div className="creator-avatar">{creator.photoURL ? <img src={creator.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(creator.name)}<span /></div>
                    <h3>{creator.name}</h3>
                    <p>{creator.bio || "AI workflow creator"}</p>
                    <div>
                      <span>{creator.promptCount || 0}<small>prompts</small></span>
                      <span>{formatCompact(creator.totalCopies)}<small>copies</small></span>
                    </div>
                    <Link href={`/creators/${creator._id}`}>View creator <ArrowRight /></Link>
                  </Reveal>
                ))}
              </div>
            ) : <div className="dark-empty">{loading ? "Loading creators…" : "Creator rankings will appear after prompts are approved."}</div>}
          </div>
        </section>

        <section className="section shell reviews-section">
          <SectionHeading eyebrow="From the community" title="A better prompt changes the work" />
          {reviews.length ? (
            <div className="review-grid">
              {reviews.slice(0, 3).map((review, index) => (
                <Reveal className={`review-card review-${index + 1}`} key={review._id} delay={index * 0.08}>
                  <div className="stars">{[1, 2, 3, 4, 5].map((number) => <Star key={number} size={15} fill={number <= review.rating ? "currentColor" : "none"} />)}</div>
                  <blockquote>“{review.comment}”</blockquote>
                  <div><span>{initials(review.user?.name || "Member")}</span><p><strong>{review.user?.name || "PromptArc member"}</strong><small>{review.prompt?.title || "Verified review"}</small></p></div>
                </Reveal>
              ))}
            </div>
          ) : <EmptySection title="No community reviews yet" copy="Reviews submitted by members will appear here directly from the database." />}
        </section>

        <section className="section shell">
          <Reveal className="cta-panel">
            <div><span className="eyebrow">Your ideas, amplified</span><h2>Bring your best prompt.<br /><em>Build your reputation.</em></h2></div>
            <div className="cta-actions"><Link className="button" href={user ? "/dashboard/add-prompt" : "/register"}>Publish a prompt <ArrowRight /></Link><small>Free accounts can publish up to three prompts.</small></div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CardSkeleton() {
  return <div className="skeleton-grid home-skeleton">{Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index}><span /><span /><span /><span /></div>)}</div>;
}

function EmptySection({ title, copy, actionHref = "", actionLabel = "" }) {
  return (
    <div className="empty-state section-empty">
      <Sparkles />
      <h2>{title}</h2>
      <p>{copy}</p>
      {actionHref && <Link className="button" href={actionHref}>{actionLabel} <ArrowRight /></Link>}
    </div>
  );
}

function initials(name) {
  return String(name).split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function randomTags(prompts) {
  const values = [...new Set(prompts.flatMap((prompt) => Array.isArray(prompt.tags) ? prompt.tags : []))];
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values.slice(0, 5);
}

function formatCompact(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000)
    return `${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1000)
    return `${(number / 1000).toFixed(1)}K`;
  return number.toLocaleString();
}

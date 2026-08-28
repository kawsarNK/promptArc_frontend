"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Copy, Sparkles, Star, WandSparkles } from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PromptCard } from "@/components/prompt-card";
import { api } from "@/lib/api";

export function CreatorProfile({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.creatorProfile(id)
      .then((response) => {
        if (active)
          setData(response);
      })
      .catch((requestError) => {
        if (active)
          setError(requestError instanceof Error ? requestError.message : "Could not load creator profile");
      })
      .finally(() => {
        if (active)
          setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading)
    return <div className="site-page"><Navbar /><main className="detail-loading shell"><div className="spinner" /><p>Loading creator profile…</p></main></div>;

  if (error || !data)
    return <div className="site-page"><Navbar /><main className="empty-state detail-empty"><Sparkles /><h1>{error || "Creator not found"}</h1><Link className="button" href="/prompts">Browse prompts</Link></main><Footer /></div>;

  const { creator, stats, prompts } = data;
  return (
    <div className="site-page creator-profile-page">
      <Navbar />
      <main>
        <section className="creator-profile-hero">
          <div className="shell">
            <Link className="back-link" href="/prompts"><ArrowLeft /> Back to marketplace</Link>
            <div className="creator-profile-intro">
              <div className="creator-profile-avatar">
                {creator.photoURL ? <img src={creator.photoURL} alt={`${creator.name} profile`} /> : initials(creator.name)}
              </div>
              <div>
                <span className="eyebrow">{creator.role} profile</span>
                <h1>{creator.name}</h1>
                <p>{creator.bio || "This creator has not added a public bio yet."}</p>
                <small>Member since {new Date(creator.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</small>
              </div>
            </div>
            <div className="creator-profile-stats">
              <Stat icon={WandSparkles} label="Approved prompts" value={stats.totalPrompts} />
              <Stat icon={Copy} label="Total copies" value={formatNumber(stats.totalCopies)} />
              <Stat icon={Bookmark} label="Total saves" value={formatNumber(stats.totalBookmarks)} />
              <Stat icon={Star} label="Average rating" value={Number(stats.averageRating || 0).toFixed(1)} />
            </div>
          </div>
        </section>

        <section className="section shell">
          <div className="dashboard-head creator-prompts-head">
            <div><span>Published work</span><h2>Prompts by {creator.name}</h2><p>Only approved prompts are shown here.</p></div>
          </div>
          {prompts.length ? <div className="prompt-grid">{prompts.map((prompt, index) => <PromptCard key={prompt._id} prompt={prompt} index={index} />)}</div> : <div className="empty-state section-empty"><Sparkles /><h2>No approved prompts yet</h2><p>Approved work will appear automatically.</p></div>}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <article><Icon /><div><strong>{value}</strong><span>{label}</span></div></article>;
}

function initials(name) {
  return String(name).split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

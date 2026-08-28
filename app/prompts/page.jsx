"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PromptCard } from "@/components/prompt-card";
import { api } from "@/lib/api";

const categories = ["All", "Productivity", "Research", "Design", "Marketing", "Development", "Education"];
const tools = ["All", "ChatGPT", "Claude", "Gemini", "Midjourney"];
const levels = ["All", "Beginner", "Intermediate", "Pro"];
const emptyResult = { prompts: [], page: 1, pages: 1, total: 0 };

export default function PromptsPage() {
  return <Suspense fallback={<MarketplaceSkeleton />}><Marketplace /></Suspense>;
}

function Marketplace() {
  const params = useSearchParams();
  const router = useRouter();
  const requestId = useRef(0);
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [tool, setTool] = useState(params.get("aiTool") || params.get("tool") || "All");
  const [difficulty, setDifficulty] = useState(params.get("difficulty") || "All");
  const [sort, setSort] = useState(params.get("sort") || "popular");
  const [page, setPage] = useState(Math.max(1, Number(params.get("page")) || 1));
  const [mobileFilters, setMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(emptyResult);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      const query = new URLSearchParams();
      if (search.trim())
        query.set("search", search.trim());
      if (category !== "All")
        query.set("category", category);
      if (tool !== "All")
        query.set("aiTool", tool);
      if (difficulty !== "All")
        query.set("difficulty", difficulty);
      query.set("sort", sort);
      query.set("page", String(page));
      query.set("limit", "6");
      router.replace(`/prompts?${query.toString()}`, { scroll: false });
      setLoading(true);
      setError("");
      try {
        const response = await api.prompts(query.toString());
        if (requestId.current !== currentRequest)
          return;
        if (page > response.pages) {
          setPage(response.pages);
          return;
        }
        setResult(response);
      }
      catch (requestError) {
        if (requestId.current !== currentRequest)
          return;
        setResult(emptyResult);
        setError(requestError instanceof Error ? requestError.message : "Could not load prompts");
      }
      finally {
        if (requestId.current === currentRequest)
          setLoading(false);
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [search, category, tool, difficulty, sort, page, router, reload]);

  const hasFilters = Boolean(search.trim()) || category !== "All" || tool !== "All" || difficulty !== "All";
  const summary = useMemo(() => `${result.total} ${result.total === 1 ? "prompt" : "prompts"}`, [result.total]);

  function clear() {
    setSearch("");
    setCategory("All");
    setTool("All");
    setDifficulty("All");
    setPage(1);
  }

  return (
    <div className="site-page marketplace-page">
      <Navbar />
      <main>
        <section className="market-head">
          <div className="shell">
            <span className="eyebrow">Explore the marketplace</span>
            <h1>Find a prompt for your <em>next breakthrough.</em></h1>
            <p>Search field-tested prompts across tools, disciplines, and experience levels.</p>
            <div className="market-search">
              <Search />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search titles, tags, or AI tools…" />
              {search && <button onClick={() => { setSearch(""); setPage(1); }} aria-label="Clear search"><X /></button>}
            </div>
          </div>
        </section>

        <section className="market-layout shell">
          <button className="button filter-toggle" onClick={() => setMobileFilters(true)}><Filter size={17} /> Filters</button>
          <aside className={mobileFilters ? "filter-panel is-open" : "filter-panel"}>
            <div className="filter-title"><span><SlidersHorizontal /> Filters</span><button onClick={() => setMobileFilters(false)} aria-label="Close filters"><X /></button></div>
            <FilterGroup label="Category" values={categories} value={category} onChange={(value) => { setCategory(value); setPage(1); }} />
            <FilterGroup label="AI tool" values={tools} value={tool} onChange={(value) => { setTool(value); setPage(1); }} />
            <FilterGroup label="Difficulty" values={levels} value={difficulty} onChange={(value) => { setDifficulty(value); setPage(1); }} />
            {hasFilters && <button className="clear-filter" onClick={clear}>Clear all filters</button>}
            <button className="button filter-apply" onClick={() => setMobileFilters(false)}>Show {summary}</button>
          </aside>

          <div className="market-results">
            <div className="result-toolbar">
              <div><strong>{summary}</strong><span> curated for useful outcomes</span></div>
              <label>Sort by
                <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
                  <option value="popular">Most popular</option>
                  <option value="copied">Most copied</option>
                  <option value="latest">Latest</option>
                </select>
              </label>
            </div>

            {loading ? <MarketplaceSkeleton compact /> : error ? (
              <div className="empty-state request-error">
                <AlertTriangle />
                <h2>Could not load the marketplace</h2>
                <p>{error}</p>
                <button className="button" onClick={() => setReload((value) => value + 1)}>Try again</button>
              </div>
            ) : result.prompts.length ? (
              <div className="prompt-grid market-grid">{result.prompts.map((prompt, index) => <PromptCard key={prompt._id} prompt={prompt} index={index} />)}</div>
            ) : (
              <div className="empty-state"><Sparkles /><h2>No prompts found</h2><p>Try a broader search or reset one of your filters.</p>{hasFilters && <button className="button" onClick={clear}>Reset filters</button>}</div>
            )}

            {!loading && !error && result.pages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft /> Previous</button>
                {Array.from({ length: result.pages }, (_, index) => index + 1).map((number) => <button className={page === number ? "active" : ""} key={number} onClick={() => setPage(number)}>{number}</button>)}
                <button disabled={page >= result.pages} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight /></button>
              </nav>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function FilterGroup({ label, values, value, onChange }) {
  return (
    <fieldset className="filter-group">
      <legend>{label}</legend>
      {values.map((item) => <label key={item}><input type="radio" name={label} checked={value === item} onChange={() => onChange(item)} /><span>{item}</span></label>)}
    </fieldset>
  );
}

function MarketplaceSkeleton({ compact = false }) {
  return <div className={compact ? "skeleton-grid" : "skeleton-page shell"}>{Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index}><span /><span /><span /><span /></div>)}</div>;
}

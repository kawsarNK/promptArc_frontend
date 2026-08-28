"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bookmark,
  ChevronRight,
  Crown,
  ExternalLink,
  MoreHorizontal,
  Search,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import {
  DashboardEmpty,
  formatDate,
  formatNumber,
  initials,
  PageHead,
  Pagination,
  PanelError,
  PanelLoading,
} from "./shared";

export function SavedPrompts({ token }) {
  const pageSize = 9;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ prompts: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search.trim())
        query.set("search", search.trim());
      setLoading(true);
      setError("");
      api.savedPrompts(query.toString(), token)
        .then((response) => {
          if (!active)
            return;
          if (page > response.pages) {
            setPage(response.pages);
            return;
          }
          setResult(response);
        })
        .catch((requestError) => {
          if (active)
            setError(requestError instanceof Error ? requestError.message : "Could not load saved prompts");
        })
        .finally(() => {
          if (active)
            setLoading(false);
        });
    }, 240);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [token, page, search, reload]);

  async function remove(prompt) {
    try {
      const response = await api.removeBookmark(prompt._id, token);
      toast.success(response.message || "Bookmark removed");
      setReload((value) => value + 1);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not remove bookmark");
    }
  }

  return (
    <>
      <PageHead eyebrow="Your library" title="Saved prompts" copy="Only prompts you bookmarked are loaded from the database." />
      <section className="dashboard-panel saved-panel">
        <div className="table-tools"><div className="dashboard-search"><Search /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search saved prompts…" /></div></div>
        {loading && !result.prompts.length ? <PanelLoading label="Loading saved prompts…" /> : error ? <PanelError message={error} onRetry={() => setReload((value) => value + 1)} /> : result.prompts.length ? (
          <div className="dashboard-card-grid">
            {result.prompts.map((prompt) => (
              <article key={prompt._id}>
                <div><span>{prompt.aiTool}</span><button onClick={() => remove(prompt)} title="Remove bookmark"><Bookmark fill="currentColor" /></button></div>
                <h3>{prompt.title}</h3>
                <p>{prompt.description}</p>
                <div className="saved-card-meta"><small>{prompt.visibility === "private" ? "Premium" : "Public"}</small><small>{formatNumber(prompt.copyCount)} copies</small></div>
                <Link href={`/prompts/${prompt._id}`}>View details <ChevronRight /></Link>
              </article>
            ))}
          </div>
        ) : <DashboardEmpty title="No saved prompts" copy={search ? "No saved prompt matches that search." : "Bookmark a marketplace prompt and it will appear here immediately."} action={<Link className="button button-sm" href="/prompts">Explore prompts</Link>} />}
        <Pagination page={result.page} pages={result.pages} total={result.total} pageSize={pageSize} onPage={setPage} />
      </section>
    </>
  );
}

export function MyReviews({ token }) {
  const pageSize = 8;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ reviews: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search.trim())
        query.set("search", search.trim());
      setLoading(true);
      setError("");
      api.myReviews(query.toString(), token)
        .then((response) => {
          if (!active)
            return;
          if (page > response.pages) {
            setPage(response.pages);
            return;
          }
          setResult(response);
        })
        .catch((requestError) => {
          if (active)
            setError(requestError instanceof Error ? requestError.message : "Could not load reviews");
        })
        .finally(() => {
          if (active)
            setLoading(false);
        });
    }, 240);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [token, page, search, reload]);

  async function remove(review) {
    if (!window.confirm(`Delete your review of “${review.prompt.title}”?`))
      return;
    try {
      const response = await api.deleteReview(review.prompt._id, token);
      toast.success(response.message || "Review deleted");
      setOpenMenu(null);
      setReload((value) => value + 1);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not delete review");
    }
  }

  return (
    <>
      <PageHead eyebrow="Your contributions" title="My reviews" copy="Feedback you submitted, loaded from your review records." />
      <section className="dashboard-panel review-table review-section-panel">
        <div className="table-tools"><div className="dashboard-search"><Search /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search reviewed prompts…" /></div></div>
        {loading && !result.reviews.length ? <PanelLoading label="Loading reviews…" /> : error ? <PanelError message={error} onRetry={() => setReload((value) => value + 1)} /> : result.reviews.length ? result.reviews.map((review) => (
          <article key={review._id}>
            <span className="review-avatar">{initials(review.prompt?.title)}</span>
            <div>
              <div><strong>{review.prompt?.title}</strong><small>{Array.from({ length: 5 }, (_, index) => <Star key={index} fill={index < review.rating ? "currentColor" : "none"} />)}</small><time>{formatDate(review.updatedAt || review.createdAt)}</time></div>
              <p>{review.comment}</p>
              <span className="review-tool">{review.prompt?.aiTool}</span>
            </div>
            <div className="action-menu-wrap">
              <button onClick={() => setOpenMenu(openMenu === review._id ? null : review._id)} aria-expanded={openMenu === review._id}><MoreHorizontal /></button>
              {openMenu === review._id && <div className="action-menu"><Link href={`/prompts/${review.prompt._id}`}><ExternalLink /> View prompt</Link><button onClick={() => remove(review)}><Trash2 /> Delete review</button></div>}
            </div>
          </article>
        )) : <DashboardEmpty title="No reviews yet" copy={search ? "No review matches that search." : "Reviews you write on accessible prompts will appear here."} action={<Link className="button button-sm" href="/prompts">Find a prompt to review</Link>} />}
        <Pagination page={result.page} pages={result.pages} total={result.total} pageSize={pageSize} onPage={setPage} />
      </section>
    </>
  );
}

export function Profile({ token }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "", photoURL: user?.photoURL || "" });
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    setForm({ name: user?.name || "", bio: user?.bio || "", photoURL: user?.photoURL || "" });
  }, [user]);

  useEffect(() => {
    let active = true;
    setLoadingStats(true);
    api.dashboard(token, 6).then((response) => {
      if (active)
        setStats(response.stats);
    }).catch((requestError) => {
      if (active)
        setStatsError(requestError instanceof Error ? requestError.message : "Could not load profile statistics");
    }).finally(() => {
      if (active)
        setLoadingStats(false);
    });
    return () => {
      active = false;
    };
  }, [token]);

  if (!user)
    return null;

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await api.updateProfile(form, token);
      updateUser(response.user);
      toast.success(response.message || "Profile updated");
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not update profile");
    }
    finally {
      setBusy(false);
    }
  }

  const profileStats = user.role === "admin" ? [
    { value: stats?.totalUsers, label: "users" },
    { value: stats?.totalPrompts, label: "prompts" },
    { value: stats?.totalReviews, label: "reviews" },
  ] : [
    { value: stats?.totalPrompts, label: "prompts" },
    { value: stats?.totalCopies, label: "copies" },
    { value: stats?.averageRating, label: "rating", rating: true },
  ];

  return (
    <>
      <PageHead eyebrow="Account" title="Profile" copy="Manage the public identity stored on your user record." />
      <div className="profile-grid">
        <section className="dashboard-panel profile-card">
          <div className="profile-cover" />
          <div className="profile-avatar profile-avatar-image">{user.photoURL ? <img src={user.photoURL} alt={`${user.name} profile`} /> : initials(user.name)}</div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className="profile-badges"><span>{user.role}</span><span className={user.subscription}>{user.subscription}</span><span className={user.status}>{user.status}</span></div>
          {loadingStats ? <div className="mini-spinner" /> : statsError ? <p className="profile-stat-error">{statsError}</p> : (
            <div className="profile-stats">{profileStats.map((item) => <span key={item.label}><strong>{item.rating ? Number(item.value || 0).toFixed(1) : formatNumber(item.value)}</strong><small>{item.label}</small></span>)}</div>
          )}
        </section>

        <form className="dashboard-panel profile-form" onSubmit={save}>
          <div className="panel-head"><div><h2>Profile details</h2><p>Visible on your creator profile and prompt cards.</p></div><Settings /></div>
          <label>Display name<input required maxLength={80} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label>Email<input value={user.email} disabled /></label>
          <label>Bio<textarea maxLength={500} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} placeholder="Tell members what you build and what your prompts are best for." /><small>{form.bio.length}/500</small></label>
          <label>Photo URL<input type="url" maxLength={1000} value={form.photoURL} onChange={(event) => setForm((current) => ({ ...current, photoURL: event.target.value }))} placeholder="https://…" /></label>
          <button className="button" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          {user.subscription === "free" && user.role !== "admin" && (
            <div className="upgrade-inline"><Crown /><div><strong>Unlock every premium prompt</strong><p>One-time $5 payment. No recurring subscription.</p></div><Link className="button button-sm" href="/payment">Upgrade</Link></div>
          )}
        </form>
      </div>
    </>
  );
}

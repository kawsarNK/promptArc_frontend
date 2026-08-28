"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Copy,
  Crown,
  Flag,
  LockKeyhole,
  MessageSquareText,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

export function PromptDetails({ id }) {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [copyBusy, setCopyBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDescription, setReportDescription] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    if (authLoading)
      return;
    if (!user || !token) {
      router.replace(`/login?next=${encodeURIComponent(`/prompts/${id}`)}`);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    api.prompt(id, token)
      .then(({ prompt: current }) => {
        if (!active)
          return;
        setPrompt(current);
        setBookmarked(Boolean(current.isBookmarked));
      })
      .catch((requestError) => {
        if (active)
          setError(requestError instanceof Error ? requestError.message : "Could not load prompt");
      })
      .finally(() => {
        if (active)
          setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, token, user, authLoading, router]);

  if (authLoading || (!user && !error) || loading) {
    return <div className="site-page"><Navbar /><main className="detail-loading shell"><div className="spinner" /><p>Opening prompt…</p></main></div>;
  }

  if (error || !prompt) {
    return (
      <div className="site-page">
        <Navbar />
        <main className="empty-state detail-empty">
          <AlertTriangle />
          <h1>{error || "Prompt not found"}</h1>
          <Link className="button" href="/prompts">Back to marketplace</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const locked = Boolean(prompt.isLocked);
  const promptId = prompt._id;
  const creatorName = prompt.creator?.name || "PromptArc creator";
  const reviews = Array.isArray(prompt.reviews) ? prompt.reviews : [];
  const tags = Array.isArray(prompt.tags) ? prompt.tags : [];

  async function copyPrompt() {
    if (locked) {
      router.push(`/payment?next=${encodeURIComponent(`/prompts/${id}`)}`);
      return;
    }
    setCopyBusy(true);
    try {
      await writeClipboard(prompt.content);
      setCopied(true);
      toast.success("Prompt copied to clipboard");
      window.setTimeout(() => setCopied(false), 1800);
      try {
        const response = await api.copyPrompt(promptId, token);
        setPrompt((current) => ({ ...current, copyCount: response.copyCount }));
      }
      catch (trackingError) {
        toast.warning(trackingError instanceof Error ? `Copied, but the copy count was not updated: ${trackingError.message}` : "Copied, but the copy count was not updated");
      }
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not copy prompt");
    }
    finally {
      setCopyBusy(false);
    }
  }

  async function toggleBookmark() {
    setBookmarkBusy(true);
    try {
      const response = await api.bookmarkPrompt(promptId, token);
      setBookmarked(response.bookmarked);
      setPrompt((current) => ({ ...current, bookmarkCount: response.bookmarkCount }));
      toast.success(response.bookmarked ? "Prompt bookmarked" : "Bookmark removed");
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not update bookmark");
    }
    finally {
      setBookmarkBusy(false);
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    setReportBusy(true);
    try {
      const response = await api.reportPrompt(promptId, { reason: reportReason, description: reportDescription }, token);
      toast.success(response.message || "Report submitted for review");
      setReportOpen(false);
      setReportDescription("");
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not submit report");
    }
    finally {
      setReportBusy(false);
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!comment.trim())
      return;
    setReviewBusy(true);
    try {
      const response = await api.reviewPrompt(promptId, { rating, comment }, token);
      setPrompt((current) => {
        const withoutCurrent = (current.reviews || []).filter((review) => review._id !== response.review._id && review.user?._id !== response.review.user?._id);
        return {
          ...current,
          reviews: [response.review, ...withoutCurrent],
          averageRating: response.averageRating,
          reviewCount: response.reviewCount,
        };
      });
      toast.success(response.message || "Review published");
      setReviewOpen(false);
      setComment("");
      setRating(5);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not publish review");
    }
    finally {
      setReviewBusy(false);
    }
  }

  return (
    <div className="site-page detail-page">
      <Navbar />
      <main>
        <div className="detail-shell shell">
          <Link className="back-link" href="/prompts"><ArrowLeft /> Back to marketplace</Link>
          {prompt.status !== "approved" && (
            <div className={`moderation-banner ${prompt.status}`}>
              <strong>This prompt is {prompt.status}.</strong>
              {prompt.rejectionFeedback && <span>Moderator feedback: {prompt.rejectionFeedback}</span>}
            </div>
          )}
          <div className="detail-grid">
            <article className="prompt-detail-main">
              <div className="detail-labels">
                <span><Sparkles />{prompt.aiTool}</span>
                <span>{prompt.category}</span>
                <span>{prompt.difficulty}</span>
                {prompt.visibility === "private" && <span className="premium-pill"><Crown />Premium</span>}
              </div>
              <h1>{prompt.title}</h1>
              <p className="detail-lead">{prompt.description}</p>
              <div className="detail-meta">
                <Link className="creator-mini creator-large" href={`/creators/${prompt.creator?._id}`}>
                  <span>{prompt.creator?.photoURL ? <img src={prompt.creator.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(creatorName)}</span>
                  <div><small>Created by</small><strong>{creatorName}</strong></div>
                </Link>
                <div className="rating-meta"><Star fill="currentColor" /><strong>{Number(prompt.averageRating || 0).toFixed(1)}</strong><span>{prompt.reviewCount || 0} reviews</span></div>
              </div>

              <section className="prompt-content-card">
                <div className="content-card-head">
                  <div><span>THE PROMPT</span><small>{locked ? "Premium access required" : "Ready to copy and adapt"}</small></div>
                  <button className="button button-sm" onClick={copyPrompt} disabled={copyBusy}>
                    {locked ? <LockKeyhole /> : copied ? <Check /> : <Copy />}
                    {locked ? "Unlock" : copyBusy ? "Copying…" : copied ? "Copied" : "Copy prompt"}
                  </button>
                </div>
                <div className={locked ? "prompt-content is-locked" : "prompt-content"}>
                  <pre>{prompt.content}</pre>
                  {locked && (
                    <div className="lock-overlay">
                      <Crown />
                      <h3>This is a Premium prompt</h3>
                      <p>Bookmark it now, or unlock the full content, copying, and reviews with a one-time $5 payment.</p>
                      <Link className="button" href={`/payment?next=${encodeURIComponent(`/prompts/${id}`)}`}>Unlock Premium</Link>
                    </div>
                  )}
                </div>
              </section>

              <section className="instructions">
                <h2>How to get the best result</h2>
                <p>{locked ? "Unlock this Premium prompt to view the creator’s usage instructions." : prompt.usageInstructions || "The creator has not added usage instructions yet."}</p>
                <div>{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
              </section>

              <section className="reviews-list">
                <div className="reviews-head">
                  <div><h2>Community reviews</h2><p>What members achieved with this prompt.</p></div>
                  {!locked && <button className="button button-ghost" onClick={() => setReviewOpen(true)}><MessageSquareText /> Write a review</button>}
                </div>
                {reviews.length ? reviews.map((review) => (
                  <article key={review._id}>
                    <div className="review-avatar">{review.user?.photoURL ? <img src={review.user.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(review.user?.name || "Member")}</div>
                    <div>
                      <div className="review-row">
                        <strong>{review.user?.name || "PromptArc member"}</strong>
                        {review.user?.email && <span className="review-email">{review.user.email}</span>}
                        <span>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={index < review.rating ? "currentColor" : "none"} />)}</span>
                        <small>{new Date(review.updatedAt || review.createdAt).toLocaleDateString()}</small>
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  </article>
                )) : <div className="inline-empty">No reviews yet. Be the first member to share a result.</div>}
              </section>
            </article>

            <aside className="detail-sidebar">
              <div className="action-card">
                <button className={bookmarked ? "button bookmark-button active" : "button bookmark-button"} onClick={toggleBookmark} disabled={bookmarkBusy}>
                  <Bookmark fill={bookmarked ? "currentColor" : "none"} />
                  {bookmarkBusy ? "Saving…" : bookmarked ? "Saved to library" : "Bookmark prompt"}
                </button>
                <button className="button button-ghost" onClick={() => setReportOpen(true)}><Flag /> Report prompt</button>
                <div className="mini-stats">
                  <span><strong>{Number(prompt.copyCount || 0).toLocaleString()}</strong><small>copies</small></span>
                  <span><strong>{Number(prompt.bookmarkCount || 0).toLocaleString()}</strong><small>saves</small></span>
                </div>
              </div>

              <div className="creator-card-side">
                <span className="eyebrow">About the creator</span>
                <div className="creator-avatar large">{prompt.creator?.photoURL ? <img src={prompt.creator.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(creatorName)}<span /></div>
                <h3>{creatorName}</h3>
                <p>{prompt.creator?.bio || "PromptArc creator sharing practical systems for clearer, more useful AI output."}</p>
                <Link className="text-link" href={`/creators/${prompt.creator?._id}`}>View creator profile <ArrowRight /></Link>
              </div>

              <div className="quality-note"><div className="quality-icon"><Check /></div><div><strong>{prompt.status === "approved" ? "Quality reviewed" : "Creator preview"}</strong><p>{prompt.status === "approved" ? "Approved by PromptArc moderation for clarity, safety, and usefulness." : "Only the creator and administrators can view this moderation state."}</p></div></div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      {reportOpen && (
        <Modal title="Report this prompt" onClose={() => setReportOpen(false)}>
          <form className="modal-form" onSubmit={submitReport}>
            <label>Reason
              <select value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
                <option>Inappropriate content</option>
                <option>Spam</option>
                <option>Copyright violation</option>
                <option>Misleading information</option>
              </select>
            </label>
            <label>Optional details<textarea maxLength={1200} value={reportDescription} onChange={(event) => setReportDescription(event.target.value)} placeholder="Help the moderation team understand the issue…" /><small>{reportDescription.length}/1200</small></label>
            <button className="button" type="submit" disabled={reportBusy}><Send /> {reportBusy ? "Submitting…" : "Submit report"}</button>
          </form>
        </Modal>
      )}

      {reviewOpen && (
        <Modal title="Share your experience" onClose={() => setReviewOpen(false)}>
          <form className="modal-form" onSubmit={submitReview}>
            <label>Rating
              <div className="rating-picker">{[1, 2, 3, 4, 5].map((number) => <button type="button" key={number} onClick={() => setRating(number)} aria-label={`${number} stars`}><Star fill={number <= rating ? "currentColor" : "none"} /></button>)}</div>
            </label>
            <label>Review<textarea required maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did this prompt help you accomplish?" /><small>{comment.length}/1000</small></label>
            <button className="button" type="submit" disabled={reviewBusy}><Send /> {reviewBusy ? "Publishing…" : "Publish review"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Close"><X /></button></div>{children}</div></div>;
}

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(String(text || ""));
    return;
  }
  const field = document.createElement("textarea");
  field.value = String(text || "");
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied)
    throw new Error("Clipboard access is unavailable in this browser");
}

function initials(name) {
  return String(name).split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Check,
  ChevronRight,
  Eye,
  ImagePlus,
  MoreHorizontal,
  PenLine,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import {
  DashboardEmpty,
  formatDate,
  formatNumber,
  Modal,
  PageHead,
  Pagination,
  PanelError,
  PanelLoading,
  StatusBadge,
} from "./shared";

const emptyForm = {
  title: "",
  description: "",
  content: "",
  category: "Productivity",
  aiTool: "ChatGPT",
  tags: "",
  difficulty: "Beginner",
  visibility: "public",
  thumbnail: "",
  usageInstructions: "",
};

export function AddPrompt({ token, role }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function upload(file) {
    if (!file || !token)
      return;
    setUploading(true);
    try {
      const { url } = await api.upload(file, token);
      setForm((current) => ({ ...current, thumbnail: url }));
      toast.success("Thumbnail uploaded");
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
    finally {
      setUploading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await api.createPrompt(toPayload(form), token);
      toast.success(response.message || "Prompt saved");
      router.push(role === "admin" ? "/dashboard/all-prompts" : "/dashboard/my-prompts");
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save prompt");
    }
    finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        eyebrow={role === "admin" ? "Administrator publishing" : "Creator tools"}
        title="Add a new prompt"
        copy={role === "admin" ? "Administrator prompts are published immediately. Other roles submit to moderation." : "Share a clear, reusable prompt. New submissions remain pending until an administrator reviews them."}
      />
      <form className="prompt-form" onSubmit={submit}>
        <PromptFormSections form={form} setForm={setForm} uploading={uploading} onUpload={upload} />
        <div className="form-actions">
          <Link className="button button-ghost" href="/dashboard">Cancel</Link>
          <button className="button" disabled={busy || uploading}>{busy ? "Submitting…" : <>{role === "admin" ? "Publish prompt" : "Submit for review"} <ChevronRight /></>}</button>
        </div>
      </form>
    </>
  );
}

export function PromptTable({ role, token }) {
  const admin = role === "admin";
  const pageSize = 8;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tool, setTool] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ prompts: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search.trim())
        query.set("search", search.trim());
      if (status)
        query.set("status", status);
      if (admin && tool)
        query.set("aiTool", tool);
      setLoading(true);
      setError("");
      const request = admin ? api.adminPrompts(query.toString(), token) : api.myPrompts(query.toString(), token);
      request.then((response) => {
        if (!active)
          return;
        if (page > response.pages) {
          setPage(response.pages);
          return;
        }
        setResult(response);
      }).catch((requestError) => {
        if (active)
          setError(requestError instanceof Error ? requestError.message : "Could not load prompts");
      }).finally(() => {
        if (active)
          setLoading(false);
      });
    }, 260);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [admin, token, page, search, status, tool, reload]);

  async function remove(prompt) {
    if (!window.confirm(`Delete “${prompt.title}”? This cannot be undone.`))
      return;
    try {
      const response = admin ? await api.deleteAdminPrompt(prompt._id, token) : await api.deletePrompt(prompt._id, token);
      toast.success(response.message || "Prompt deleted");
      setReload((value) => value + 1);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not delete prompt");
    }
  }

  async function moderate(prompt, nextStatus) {
    const feedback = nextStatus === "rejected" ? window.prompt("Provide rejection feedback for the creator:")?.trim() : "";
    if (nextStatus === "rejected" && !feedback)
      return;
    try {
      const response = await api.moderatePrompt(prompt._id, nextStatus, token, feedback);
      toast.success(response.message || `Prompt ${nextStatus}`);
      setReload((value) => value + 1);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not moderate prompt");
    }
  }

  async function feature(prompt) {
    try {
      const response = await api.featurePrompt(prompt._id, token);
      toast.success(response.message || "Featured status updated");
      setReload((value) => value + 1);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not update featured status");
    }
  }

  const action = <Link className="button" href="/dashboard/add-prompt"><Plus /> {admin ? "Add admin prompt" : "Add prompt"}</Link>;

  return (
    <>
      <PageHead
        eyebrow={admin ? "Moderation" : "Creator tools"}
        title={admin ? "Prompt moderation" : "My prompts"}
        copy={admin ? "Search, filter, approve, reject, edit, feature, and remove live database records." : "Manage your submissions, edit content, and see current performance totals."}
        action={action}
      />
      <section className="dashboard-panel table-panel">
        <div className="table-tools">
          <div className="dashboard-search"><Search /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search prompts…" /></div>
          <div className="table-filter-row">
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            {admin && <select value={tool} onChange={(event) => { setTool(event.target.value); setPage(1); }} aria-label="Filter by AI tool"><option value="">All tools</option><option>ChatGPT</option><option>Claude</option><option>Gemini</option><option>Midjourney</option></select>}
          </div>
        </div>

        {loading && !result.prompts.length ? <PanelLoading label="Loading prompts…" /> : error ? <PanelError message={error} onRetry={() => setReload((value) => value + 1)} /> : result.prompts.length ? (
          <PromptRows
            rows={result.prompts}
            admin={admin}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            onEdit={setEditing}
            onAnalytics={setAnalytics}
            onDelete={remove}
            onModerate={moderate}
            onFeature={feature}
          />
        ) : <DashboardEmpty title="No prompts found" copy={search || status || tool ? "Try a different search or filter." : "Your submitted prompts will appear here from the database."} action={!admin ? <Link className="button button-sm" href="/dashboard/add-prompt"><Plus /> Add prompt</Link> : null} />}

        <Pagination page={result.page} pages={result.pages} total={result.total} pageSize={pageSize} onPage={setPage} />
      </section>

      {editing && <PromptEditor prompt={editing} token={token} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setReload((value) => value + 1); }} />}
      {analytics && <PromptAnalytics prompt={analytics} onClose={() => setAnalytics(null)} />}
    </>
  );
}

function PromptRows({ rows, admin, openMenu, setOpenMenu, onEdit, onAnalytics, onDelete, onModerate, onFeature }) {
  return (
    <div className="responsive-table action-table">
      <table>
        <thead><tr><th>Prompt</th><th>Status</th><th>Copies</th><th>Rating</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>{rows.map((prompt) => (
          <tr key={prompt._id}>
            <td><div className="table-prompt-icon">{String(prompt.aiTool || "P").slice(0, 1)}</div><div><strong>{prompt.title}</strong><small>{prompt.creator?.name ? `${prompt.creator.name} · ` : ""}{prompt.aiTool} · {prompt.category}{prompt.featured ? " · Featured" : ""}</small></div></td>
            <td><StatusBadge value={prompt.status} /></td>
            <td>{formatNumber(prompt.copyCount)}</td>
            <td>{Number(prompt.averageRating || 0).toFixed(1)}</td>
            <td>{formatDate(prompt.createdAt)}</td>
            <td>
              <div className="row-actions">
                {admin ? (
                  <>
                    <button title="Approve" disabled={prompt.status === "approved"} onClick={() => onModerate(prompt, "approved")}><Check /></button>
                    <button title="Reject with feedback" disabled={prompt.status === "rejected"} onClick={() => onModerate(prompt, "rejected")}><X /></button>
                    <button title={prompt.featured ? "Remove featured status" : "Feature prompt"} disabled={prompt.status !== "approved"} onClick={() => onFeature(prompt)}><Sparkles fill={prompt.featured ? "currentColor" : "none"} /></button>
                  </>
                ) : <button title="Edit prompt" onClick={() => onEdit(prompt)}><PenLine /></button>}
                <button title="Delete prompt" onClick={() => onDelete(prompt)}><Trash2 /></button>
                <div className="action-menu-wrap">
                  <button title="More actions" aria-expanded={openMenu === prompt._id} onClick={() => setOpenMenu(openMenu === prompt._id ? null : prompt._id)}><MoreHorizontal /></button>
                  {openMenu === prompt._id && (
                    <div className="action-menu">
                      <Link href={`/prompts/${prompt._id}`} onClick={() => setOpenMenu(null)}><Eye /> View details</Link>
                      <button onClick={() => { onEdit(prompt); setOpenMenu(null); }}><PenLine /> Edit prompt</button>
                      <button onClick={() => { onAnalytics(prompt); setOpenMenu(null); }}><BarChart3 /> View analytics</button>
                      {admin && <button onClick={() => { onFeature(prompt); setOpenMenu(null); }} disabled={prompt.status !== "approved"}><Sparkles /> {prompt.featured ? "Unfeature" : "Feature"}</button>}
                    </div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function PromptEditor({ prompt, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: prompt.title || "",
    description: prompt.description || "",
    content: prompt.content || "",
    category: prompt.category || "Productivity",
    aiTool: prompt.aiTool || "ChatGPT",
    tags: (prompt.tags || []).join(", "),
    difficulty: prompt.difficulty || "Beginner",
    visibility: prompt.visibility || "public",
    thumbnail: prompt.thumbnail || "",
    usageInstructions: prompt.usageInstructions || "",
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function upload(file) {
    if (!file)
      return;
    setUploading(true);
    try {
      const { url } = await api.upload(file, token);
      setForm((current) => ({ ...current, thumbnail: url }));
      toast.success("Thumbnail uploaded");
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
    finally {
      setUploading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await api.updatePrompt(prompt._id, toPayload(form), token);
      toast.success(response.message || "Prompt updated");
      onSaved();
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update prompt");
    }
    finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Edit prompt" copy="Saving an update resubmits non-admin prompts for moderation." onClose={onClose} wide>
      <form className="prompt-form modal-prompt-form" onSubmit={submit}>
        <PromptFormSections form={form} setForm={setForm} uploading={uploading} onUpload={upload} compact />
        <div className="form-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button className="button" disabled={busy || uploading}>{busy ? "Saving…" : "Save changes"}</button></div>
      </form>
    </Modal>
  );
}

function PromptAnalytics({ prompt, onClose }) {
  return (
    <Modal title="Prompt analytics" copy={prompt.title} onClose={onClose}>
      <div className="prompt-analytics-grid">
        <article><span>Copies</span><strong>{formatNumber(prompt.copyCount)}</strong></article>
        <article><span>Bookmarks</span><strong>{formatNumber(prompt.bookmarkCount)}</strong></article>
        <article><span>Average rating</span><strong>{Number(prompt.averageRating || 0).toFixed(1)}</strong></article>
        <article><span>Reviews</span><strong>{formatNumber(prompt.reviewCount)}</strong></article>
      </div>
      <div className="analytics-note"><BarChart3 /><p>These totals are read directly from the prompt record. Month-by-month copy events are not stored by the current data model.</p></div>
      <Link className="button button-wide" href={`/prompts/${prompt._id}`}>Open prompt details <ChevronRight /></Link>
    </Modal>
  );
}

function PromptFormSections({ form, setForm, uploading, onUpload, compact = false }) {
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  return (
    <>
      <section className="dashboard-panel">
        <div className="form-section-head"><span>01</span><div><h2>Prompt essentials</h2><p>Help members understand the outcome and intended tool.</p></div></div>
        <div className="form-grid">
          <label className="span-2">Prompt title<input required maxLength={140} value={form.title} onChange={set("title")} placeholder="e.g. Turn customer interviews into an opportunity map" /></label>
          <label className="span-2">Short description<textarea required maxLength={500} value={form.description} onChange={set("description")} placeholder="Explain the outcome and when this prompt is useful…" /><small>{form.description.length}/500</small></label>
          <label>Category<select value={form.category} onChange={set("category")}><option>Productivity</option><option>Research</option><option>Design</option><option>Marketing</option><option>Development</option><option>Education</option></select></label>
          <label>AI tool<select value={form.aiTool} onChange={set("aiTool")}><option>ChatGPT</option><option>Claude</option><option>Gemini</option><option>Midjourney</option></select></label>
          <label>Difficulty<select value={form.difficulty} onChange={set("difficulty")}><option>Beginner</option><option>Intermediate</option><option>Pro</option></select></label>
          <label>Visibility<select value={form.visibility} onChange={set("visibility")}><option value="public">Public</option><option value="private">Private / Premium</option></select></label>
          <label className="span-2">Tags <span>comma separated</span><input required value={form.tags} onChange={set("tags")} placeholder="strategy, research, planning" /></label>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="form-section-head"><span>02</span><div><h2>Prompt content</h2><p>Use double braces for variables, such as &#123;&#123;TOPIC&#125;&#125;.</p></div></div>
        <label className="content-editor"><div><b>prompt.md</b><small>Plain text or Markdown</small></div><textarea required maxLength={20000} value={form.content} onChange={set("content")} placeholder={"Act as a…\n\nYour task is to…\n\nContext: {{CONTEXT}}"} /></label>
        <label className="block-label">Usage instructions<textarea maxLength={2000} value={form.usageInstructions} onChange={set("usageInstructions")} placeholder="Explain what inputs to provide and how to iterate on the result…" /></label>
      </section>

      <section className="dashboard-panel">
        <div className="form-section-head"><span>03</span><div><h2>Thumbnail</h2><p>Upload with Cloudinary or paste an existing image URL.</p></div></div>
        <label className="block-label">Thumbnail URL<input type="url" maxLength={1000} value={form.thumbnail} onChange={set("thumbnail")} placeholder="https://…" /></label>
        {!compact && <label className="upload-zone"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onUpload(event.target.files?.[0])} /><span><ImagePlus /></span><strong>{uploading ? "Uploading…" : form.thumbnail ? "Replace thumbnail" : "Choose an image"}</strong><small>PNG, JPG, or WebP up to 5 MB</small><b><Upload /> Browse files</b></label>}
        {compact && <label className="compact-upload"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onUpload(event.target.files?.[0])} /><Upload /> {uploading ? "Uploading…" : "Upload a different image"}</label>}
      </section>
    </>
  );
}

function toPayload(form) {
  return {
    ...form,
    tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  };
}

"use client";

import { AlertTriangle, ChevronLeft, ChevronRight, LoaderCircle, Sparkles, X } from "lucide-react";

export function PageHead({ eyebrow, title, copy, action }) {
  return (
    <div className="dashboard-head">
      <div><span>{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</div>
      {action}
    </div>
  );
}

export function PanelLoading({ label = "Loading live data…" }) {
  return <div className="dashboard-state"><LoaderCircle className="spin-icon" /><p>{label}</p></div>;
}

export function PanelError({ message, onRetry }) {
  return (
    <div className="dashboard-state error">
      <AlertTriangle />
      <h3>Could not load this section</h3>
      <p>{message}</p>
      {onRetry && <button className="button button-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function DashboardEmpty({ title, copy, action }) {
  return (
    <div className="dashboard-state empty">
      <Sparkles />
      <h3>{title}</h3>
      <p>{copy}</p>
      {action}
    </div>
  );
}

export function Pagination({ page, pages, total, pageSize, onPage }) {
  if (!total)
    return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="table-pagination">
      <span>Showing {from}-{to} of {total}</span>
      <div>
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft /> Previous</button>
        <button className="active" aria-current="page">{page}</button>
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">Next <ChevronRight /></button>
      </div>
    </div>
  );
}

export function Modal({ title, copy, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={wide ? "modal dashboard-modal wide" : "modal dashboard-modal"} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
          <button onClick={onClose} aria-label="Close"><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatusBadge({ value }) {
  const normalized = String(value || "pending").toLowerCase();
  return <span className={`status ${normalized}`}>{normalized}</span>;
}

export function initials(name) {
  return String(name || "User").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function formatNumber(value, maximumFractionDigits = 1) {
  const number = Number(value || 0);
  if (number >= 1_000_000)
    return `${(number / 1_000_000).toFixed(maximumFractionDigits)}M`;
  if (number >= 1000)
    return `${(number / 1000).toFixed(maximumFractionDigits)}K`;
  return number.toLocaleString();
}

export function formatCurrency(cents) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(cents || 0) / 100);
}

export function formatDate(value) {
  if (!value)
    return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function relativeTime(value) {
  if (!value)
    return "";
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60)
    return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)
    return `${days}d ago`;
  return formatDate(value);
}

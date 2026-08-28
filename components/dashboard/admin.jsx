"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Ban,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  DashboardEmpty,
  formatCurrency,
  formatDate,
  formatNumber,
  initials,
  Modal,
  PageHead,
  Pagination,
  PanelError,
  PanelLoading,
  StatusBadge,
} from "./shared";

const USER_PAGE_SIZE = 8;
const PAYMENT_PAGE_SIZE = 10;
const REPORT_PAGE_SIZE = 8;

export function UsersAdmin({ token, currentUser }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ users: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), limit: String(USER_PAGE_SIZE) });
      if (search.trim())
        query.set("search", search.trim());
      if (role)
        query.set("role", role);
      if (status)
        query.set("status", status);
      setLoading(true);
      setError("");
      api.adminUsers(query.toString(), token)
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
            setError(requestError instanceof Error ? requestError.message : "Could not load users");
        })
        .finally(() => {
          if (active)
            setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [token, page, search, role, status, reload]);

  function updateRow(updatedUser) {
    setResult((current) => ({
      ...current,
      users: current.users.map((user) => user._id === updatedUser._id ? updatedUser : user),
    }));
    setSelected((current) => current?._id === updatedUser._id ? updatedUser : current);
  }

  async function changeRole(user, nextRole) {
    if (nextRole === user.role)
      return;
    setBusyId(user._id);
    try {
      const response = await api.updateRole(user._id, nextRole, token);
      updateRow(response.user);
      toast.success(response.message || "Role updated");
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not update role");
    }
    finally {
      setBusyId("");
    }
  }

  async function toggleStatus(user) {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    const verb = nextStatus === "active" ? "reactivate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${verb} ${user.name}?`))
      return;
    setBusyId(user._id);
    try {
      const response = await api.updateUserStatus(user._id, nextStatus, token);
      updateRow(response.user);
      setOpenMenu(null);
      toast.success(response.message || `User ${nextStatus}`);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not update account status");
    }
    finally {
      setBusyId("");
    }
  }

  async function remove(user) {
    if (!window.confirm(`Permanently delete ${user.name} and their related prompts, reviews, bookmarks, reports, and notifications?`))
      return;
    setBusyId(user._id);
    try {
      const response = await api.deleteUser(user._id, token);
      toast.success(response.message || "User deleted");
      setSelected(null);
      setOpenMenu(null);
      setReload((value) => value + 1);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not delete user");
    }
    finally {
      setBusyId("");
    }
  }

  return (
    <>
      <PageHead eyebrow="Administration" title="All users" copy="Search current accounts, change roles, and manage access using database records." />
      <section className="dashboard-panel table-panel">
        <div className="table-tools table-tools-three">
          <div className="dashboard-search"><Search /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name or email…" /></div>
          <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} aria-label="Filter by role"><option value="">All roles</option><option value="user">User</option><option value="creator">Creator</option><option value="admin">Admin</option></select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter by status"><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select>
        </div>

        {loading && !result.users.length ? <PanelLoading label="Loading user accounts…" /> : error ? <PanelError message={error} onRetry={() => setReload((value) => value + 1)} /> : result.users.length ? (
          <div className="responsive-table action-table">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Plan</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>{result.users.map((user) => {
                const isSelf = user._id === currentUser._id;
                return (
                  <tr key={user._id}>
                    <td><div className="table-user-cell"><span className="table-prompt-icon avatar-cell">{user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(user.name)}</span><div><strong>{user.name}{isSelf ? " (you)" : ""}</strong><small>{user.email}</small></div></div></td>
                    <td><select className="inline-select" value={user.role} disabled={busyId === user._id || isSelf} onChange={(event) => changeRole(user, event.target.value)} aria-label={`Change role for ${user.name}`}><option value="user">user</option><option value="creator">creator</option><option value="admin">admin</option></select></td>
                    <td><StatusBadge value={user.subscription || "free"} /></td>
                    <td><StatusBadge value={user.status || "active"} /></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-menu-wrap">
                        <button className="row-menu-button" onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)} aria-expanded={openMenu === user._id} aria-label={`Actions for ${user.name}`}><MoreHorizontal /></button>
                        {openMenu === user._id && <div className="action-menu align-right">
                          <button onClick={() => { setSelected(user); setOpenMenu(null); }}><UserRound /> View account</button>
                          {!isSelf && <button onClick={() => toggleStatus(user)} disabled={busyId === user._id}>{user.status === "suspended" ? <UserCheck /> : <Ban />}{user.status === "suspended" ? "Reactivate" : "Suspend"}</button>}
                          {!isSelf && <button className="danger" onClick={() => remove(user)} disabled={busyId === user._id}><Trash2 /> Delete user</button>}
                        </div>}
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : <DashboardEmpty title="No users found" copy={search || role || status ? "No account matches the active search and filters." : "Registered accounts will appear here."} />}
        <Pagination page={result.page} pages={result.pages} total={result.total} pageSize={USER_PAGE_SIZE} onPage={setPage} />
      </section>

      {selected && (
        <Modal title="User account" copy="Live account details from MongoDB." onClose={() => setSelected(null)}>
          <div className="admin-user-detail">
            <span className="admin-user-avatar">{selected.photoURL ? <img src={selected.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(selected.name)}</span>
            <div><h3>{selected.name}</h3><p>{selected.email}</p></div>
            <dl>
              <div><dt>Role</dt><dd><StatusBadge value={selected.role} /></dd></div>
              <div><dt>Access</dt><dd><StatusBadge value={selected.status} /></dd></div>
              <div><dt>Subscription</dt><dd><StatusBadge value={selected.subscription} /></dd></div>
              <div><dt>Joined</dt><dd>{formatDate(selected.createdAt)}</dd></div>
              <div><dt>Premium since</dt><dd>{formatDate(selected.premiumSince)}</dd></div>
            </dl>
            {selected.bio && <div className="detail-note"><strong>Bio</strong><p>{selected.bio}</p></div>}
          </div>
        </Modal>
      )}
    </>
  );
}

export function PaymentsAdmin({ token }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ payments: [], page: 1, pages: 1, total: 0, revenue: { total: 0, count: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), limit: String(PAYMENT_PAGE_SIZE) });
      if (search.trim())
        query.set("search", search.trim());
      if (status)
        query.set("status", status);
      setLoading(true);
      setError("");
      api.adminPayments(query.toString(), token)
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
            setError(requestError instanceof Error ? requestError.message : "Could not load payments");
        })
        .finally(() => {
          if (active)
            setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [token, page, search, status, reload]);

  return (
    <>
      <PageHead eyebrow="Revenue" title="All payments" copy="Completed and pending one-time Premium transactions from the payment collection." />
      <div className="stat-grid compact">
        <article><div><span>Paid revenue</span><strong>{formatCurrency(result.revenue?.total)}</strong><small>{formatNumber(result.revenue?.count)} successful payments</small></div><i><CircleDollarSign /></i></article>
        <article><div><span>Payment records</span><strong>{formatNumber(result.total)}</strong><small>Matching the current filters</small></div><i><BarChart3 /></i></article>
      </div>
      <section className="dashboard-panel table-panel">
        <div className="table-tools">
          <div className="dashboard-search"><Search /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search email or transaction ID…" /></div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter payment status"><option value="">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
        </div>
        {loading && !result.payments.length ? <PanelLoading label="Loading transactions…" /> : error ? <PanelError message={error} onRetry={() => setReload((value) => value + 1)} /> : result.payments.length ? (
          <div className="responsive-table"><table>
            <thead><tr><th>Transaction</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{result.payments.map((payment) => <tr key={payment._id}><td><div><strong>{payment.paymentIntentId || payment.stripeSessionId}</strong><small>{payment.stripeSessionId}</small></div></td><td><div><strong>{payment.user?.name || "Deleted account"}</strong><small>{payment.email}</small></div></td><td>{formatCurrency(payment.amount)} <small>{String(payment.currency || "usd").toUpperCase()}</small></td><td><StatusBadge value={payment.status} /></td><td>{formatDate(payment.createdAt)}</td></tr>)}</tbody>
          </table></div>
        ) : <DashboardEmpty title="No payments found" copy={search || status ? "No transaction matches the active filters." : "Premium payments will appear here after checkout."} />}
        <Pagination page={result.page} pages={result.pages} total={result.total} pageSize={PAYMENT_PAGE_SIZE} onPage={setPage} />
      </section>
    </>
  );
}

export function ReportsAdmin({ token }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ reports: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ page: String(page), limit: String(REPORT_PAGE_SIZE), status: status || "all" });
      if (search.trim())
        query.set("search", search.trim());
      setLoading(true);
      setError("");
      api.adminReports(query.toString(), token)
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
            setError(requestError instanceof Error ? requestError.message : "Could not load reports");
        })
        .finally(() => {
          if (active)
            setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [token, page, search, status, reload]);

  async function resolve(report, action) {
    const labels = { warned: "warn this creator", removed: "remove this prompt", dismissed: "dismiss this report" };
    if (!window.confirm(`Are you sure you want to ${labels[action]}?`))
      return;
    setBusyId(report._id);
    try {
      const response = await api.resolveReport(report._id, action, token);
      toast.success(response.message || `Report ${action}`);
      setReload((value) => value + 1);
    }
    catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not resolve report");
    }
    finally {
      setBusyId("");
    }
  }

  return (
    <>
      <PageHead eyebrow="Trust & safety" title="Reported prompts" copy="Review live member reports and record every moderation decision." />
      <section className="dashboard-panel report-panel">
        <div className="table-tools">
          <div className="dashboard-search"><Search /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search reason, prompt, or reporter…" /></div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter report status"><option value="open">Open</option><option value="warned">Warned</option><option value="dismissed">Dismissed</option><option value="removed">Removed</option><option value="all">All statuses</option></select>
        </div>
        {loading && !result.reports.length ? <PanelLoading label="Loading reports…" /> : error ? <PanelError message={error} onRetry={() => setReload((value) => value + 1)} /> : result.reports.length ? (
          <div className="report-list">{result.reports.map((report) => (
            <article className="report-card" key={report._id}>
              <div className="report-icon"><AlertTriangle /></div>
              <div className="report-content">
                <div className="report-kicker"><StatusBadge value={report.status} /><span>{report.reason}</span><time>{formatDate(report.createdAt)}</time></div>
                <h3>{report.prompt?.title || report.promptTitle || "Removed prompt"}</h3>
                <p>Reported by <strong>{report.user?.name || report.reporterName || "Deleted account"}</strong>{(report.user?.email || report.reporterEmail) && <> ({report.user?.email || report.reporterEmail})</>} · Creator: <strong>{report.prompt?.creator?.name || report.promptCreatorName || "Deleted creator"}</strong></p>
                {report.description && <div className="detail-note"><strong>Reporter note</strong><p>{report.description}</p></div>}
              </div>
              <div className="report-actions">
                {report.prompt?._id && !report.prompt?.removed ? <Link className="button button-ghost button-sm" href={`/prompts/${report.prompt._id}`}><ExternalLink /> View</Link> : <span className="removed-record-note">Prompt removed</span>}
                {report.status === "open" && <>
                  <button className="button button-sm" disabled={busyId === report._id} onClick={() => resolve(report, "removed")}><Trash2 /> Remove</button>
                  <button className="button button-ghost button-sm" disabled={busyId === report._id} onClick={() => resolve(report, "warned")}><ShieldCheck /> Warn creator</button>
                  <button className="text-link" disabled={busyId === report._id} onClick={() => resolve(report, "dismissed")}><CheckCircle2 /> Dismiss</button>
                </>}
              </div>
            </article>
          ))}</div>
        ) : <DashboardEmpty title="No reports found" copy={search || status !== "open" ? "No report matches the active search and status filter." : "There are no open moderation reports."} />}
        <Pagination page={result.page} pages={result.pages} total={result.total} pageSize={REPORT_PAGE_SIZE} onPage={setPage} />
      </section>
    </>
  );
}

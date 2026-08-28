"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Bookmark,
  CheckCheck,
  ChevronDown,
  CircleDollarSign,
  FileCheck2,
  Flag,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  UserRound,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { safeInternalPath } from "@/lib/navigation";
import { AddPrompt, PromptTable } from "./dashboard/prompts";
import { Analytics, Overview } from "./dashboard/overview";
import { MyReviews, Profile, SavedPrompts } from "./dashboard/account";
import { PaymentsAdmin, ReportsAdmin, UsersAdmin } from "./dashboard/admin";
import { initials, relativeTime } from "./dashboard/shared";

const NAV_BY_ROLE = {
  user: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "add-prompt", label: "Add prompt", icon: Plus },
    { id: "my-prompts", label: "My prompts", icon: WandSparkles },
    { id: "saved", label: "Saved prompts", icon: Bookmark },
    { id: "my-reviews", label: "My reviews", icon: MessageSquareText },
    { id: "profile", label: "Profile", icon: UserRound },
  ],
  creator: [
    { id: "overview", label: "Creator home", icon: LayoutDashboard },
    { id: "add-prompt", label: "Add prompt", icon: Plus },
    { id: "my-prompts", label: "My prompts", icon: WandSparkles },
    { id: "analytics", label: "Creator analytics", icon: BarChart3 },
    { id: "profile", label: "Creator profile", icon: UserRound },
  ],
  admin: [
    { id: "overview", label: "Command center", icon: LayoutDashboard },
    { id: "add-prompt", label: "Add admin prompt", icon: Plus },
    { id: "users", label: "All users", icon: Users },
    { id: "all-prompts", label: "All prompts", icon: FileCheck2 },
    { id: "payments", label: "All payments", icon: CircleDollarSign },
    { id: "reports", label: "Reported prompts", icon: Flag },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "profile", label: "Admin profile", icon: UserRound },
  ],
};

export function Dashboard({ section }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationError, setNotificationError] = useState("");

  useEffect(() => {
    if (!loading && !user)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!token)
      return undefined;
    let active = true;
    let timer;

    async function loadNotifications() {
      try {
        const response = await api.notifications(token, 12);
        if (active) {
          setNotifications(response.notifications || []);
          setUnreadCount(response.unreadCount || 0);
          setNotificationError("");
        }
      }
      catch (error) {
        if (active)
          setNotificationError(error instanceof Error ? error.message : "Could not load notifications");
      }
      if (active)
        timer = window.setTimeout(loadNotifications, 60_000);
    }

    void loadNotifications();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [token]);

  if (loading || !user || !token)
    return <main className="dashboard-loading"><div className="spinner" /><p>Preparing your workspace…</p></main>;

  const items = NAV_BY_ROLE[user.role] || NAV_BY_ROLE.user;
  const active = items.some((item) => item.id === section) ? section : "overview";

  function submitSearch(event) {
    event.preventDefault();
    const value = workspaceSearch.trim();
    if (value)
      router.push(`/prompts?search=${encodeURIComponent(value)}`);
  }

  async function markAllRead() {
    try {
      await api.markNotificationsRead(token);
      setUnreadCount(0);
      setNotifications((current) => current.map((notification) => ({ ...notification, readAt: notification.readAt || new Date().toISOString() })));
    }
    catch (error) {
      setNotificationError(error instanceof Error ? error.message : "Could not update notifications");
    }
  }

  async function openNotification(notification) {
    if (!notification.readAt) {
      try {
        await api.markNotificationRead(notification._id, token);
        setUnreadCount((current) => Math.max(0, current - 1));
        setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item));
      }
      catch {
        // Navigation is still useful if the read marker could not be persisted.
      }
    }
    setNotificationOpen(false);
    router.push(safeInternalPath(notification.link, "/dashboard"));
  }

  return (
    <div className="dashboard-page">
      {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close dashboard menu" />}
      <aside className={menuOpen ? "dashboard-sidebar is-open" : "dashboard-sidebar"}>
        <div className="sidebar-brand"><Brand /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
        <div className={`workspace-pill role-${user.role}`}>
          <span>{user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(user.name)}</span>
          <div><strong>{user.name}</strong><small>{roleLabel(user.role)}</small></div>
          <ChevronDown />
        </div>
        <nav aria-label={`${roleLabel(user.role)} navigation`}>
          {items.map(({ id, label, icon: Icon }) => (
            <Link className={active === id ? "active" : ""} key={id} href={id === "overview" ? "/dashboard" : `/dashboard/${id}`}>
              <Icon />{label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/"><ArrowLeft /> Back to marketplace</Link>
          <button onClick={() => { logout(); router.push("/"); }}><LogOut /> Log out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open dashboard menu"><Menu /></button>
          <form className="dashboard-search dashboard-global-search" onSubmit={submitSearch}>
            <Search /><input value={workspaceSearch} onChange={(event) => setWorkspaceSearch(event.target.value)} placeholder="Search the prompt marketplace…" aria-label="Search prompt marketplace" />
          </form>
          <div className="topbar-actions">
            <div className="notification-wrap">
              <button className={notificationOpen ? "icon-button active" : "icon-button"} onClick={() => setNotificationOpen((value) => !value)} aria-label={`${unreadCount} unread notifications`} aria-expanded={notificationOpen}>
                <Bell />{unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {notificationOpen && (
                <section className="notification-panel">
                  <div className="notification-head"><div><strong>Notifications</strong><small>{unreadCount ? `${unreadCount} unread` : "You are all caught up"}</small></div>{unreadCount > 0 && <button onClick={markAllRead}><CheckCheck /> Mark all read</button>}</div>
                  {notificationError && <div className="notification-error">{notificationError}</div>}
                  <div className="notification-list">
                    {notifications.length ? notifications.map((notification) => (
                      <button className={notification.readAt ? "notification-item" : "notification-item unread"} key={notification._id} onClick={() => openNotification(notification)}>
                        <span className="notification-avatar">{notification.actor?.photoURL ? <img src={notification.actor.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(notification.actor?.name || notification.title)}</span>
                        <span><strong>{notification.title}</strong><p>{notification.message}</p><small>{relativeTime(notification.createdAt)}</small></span>
                      </button>
                    )) : <div className="notification-empty"><Bell /><strong>No notifications yet</strong><p>Account and marketplace updates will appear here.</p></div>}
                  </div>
                </section>
              )}
            </div>
            <Link className="dashboard-avatar" href="/dashboard/profile" aria-label="Open profile">{user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : initials(user.name)}</Link>
          </div>
        </header>
        <div className="dashboard-content">{renderSection(active, user, token)}</div>
      </main>
    </div>
  );
}

function renderSection(section, user, token) {
  if (section === "add-prompt")
    return <AddPrompt token={token} role={user.role} />;
  if (section === "my-prompts")
    return <PromptTable role={user.role} token={token} />;
  if (section === "saved")
    return <SavedPrompts token={token} />;
  if (section === "my-reviews")
    return <MyReviews token={token} />;
  if (section === "profile")
    return <Profile token={token} />;
  if (section === "users")
    return <UsersAdmin token={token} currentUser={user} />;
  if (section === "all-prompts")
    return <PromptTable role="admin" token={token} />;
  if (section === "payments")
    return <PaymentsAdmin token={token} />;
  if (section === "reports")
    return <ReportsAdmin token={token} />;
  if (section === "analytics")
    return <Analytics role={user.role} token={token} />;
  return <Overview role={user.role} token={token} user={user} />;
}

function roleLabel(role) {
  if (role === "admin")
    return "Admin command center";
  if (role === "creator")
    return "Creator workspace";
  return "Member workspace";
}

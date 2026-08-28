"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Brand } from "./brand";

const THEME_KEY = "promptarc_theme";
const links = [
  { href: "/", label: "Home" },
  { href: "/prompts", label: "All prompts" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => {
      const stored = window.localStorage.getItem(THEME_KEY);
      setDark(stored ? stored === "dark" : document.documentElement.dataset.theme === "dark");
    };
    sync();
    const listener = () => sync();
    window.addEventListener("promptarc-theme", listener);
    return () => window.removeEventListener("promptarc-theme", listener);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(THEME_KEY, next);
    setDark(next === "dark");
    window.dispatchEvent(new CustomEvent("promptarc-theme", { detail: next }));
  }

  function signOut() {
    setOpen(false);
    logout();
    router.push("/");
  }

  const isActive = (href) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const name = user?.name || "Member";

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Brand />
        <nav className={open ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
          {links.map((link) => <Link key={link.href} className={isActive(link.href) ? "active" : ""} href={link.href}>{link.label}</Link>)}
          {!loading && user && <Link className={isActive("/dashboard") ? "active" : ""} href="/dashboard">Dashboard</Link>}
          <div className="mobile-auth">
            {!loading && !user ? (
              <><Link href="/login">Log in</Link><Link className="button button-sm" href="/register">Register</Link></>
            ) : user ? <button className="button button-ghost button-sm" type="button" onClick={signOut}>Log out</button> : null}
          </div>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label={dark ? "Use light theme" : "Use dark theme"}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          {!loading && !user ? (
            <><Link className="text-link desktop-auth" href="/login">Log in</Link><Link className="button button-sm desktop-auth" href="/register">Register</Link></>
          ) : user ? (
            <Link className="avatar-link" href="/dashboard" aria-label="Open dashboard">
              {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <span>{initials(name)}</span>}
            </Link>
          ) : null}
          <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  );
}

function initials(name) {
  return String(name).split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

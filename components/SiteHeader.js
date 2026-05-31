"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.svg";

export default function SiteHeader({ userEmail, onLogout, showAuthLink = false }) {
  return (
    <header className="site-header">
      <Link href="/" className="site-header__brand">
        <span className="site-header__logo" aria-hidden="true">
          <Image src={logo} alt="Park Passport" />
        </span>
        Park Passport
      </Link>
      <nav className="site-header__nav">
        {userEmail && (
          <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {userEmail}
          </span>
        )}
        {onLogout && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onLogout}>
            Log out
          </button>
        )}
        {showAuthLink && (
          <a href="#auth-section" className="btn btn--ghost btn--sm">
            Get started
          </a>
        )}
      </nav>
    </header>
  );
}

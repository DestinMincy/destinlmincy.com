import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
import { navItems } from "@/lib/site";

/**
 * Renders the site header with branding, primary navigation, the account
 * entry point (sign in for visitors, portal link and user menu for signed-in
 * users), and the theme toggle.
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" href="/" aria-label="Destin L Mincy home">
          <img
            className="brand__logo"
            src="/img/dlm-logo--hex.svg"
            alt=""
            width="34"
            height="39"
            aria-hidden="true"
          />
          <span className="brand__text">Destin L Mincy</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__account">
          <Show
            when="signed-in"
            fallback={
              <Link
                className="button button--secondary button--compact"
                href="/sign-in"
              >
                Client sign in
              </Link>
            }
          >
            <Link
              className="button button--secondary button--compact"
              href="/portal"
            >
              Portal
            </Link>
            <UserButton appearance={clerkAppearance} />
          </Show>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}

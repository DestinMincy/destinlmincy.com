import Link from "next/link";

import { navItems } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Renders the site header with branding, theme toggle, and primary navigation.
 *
 * @returns The site header component.
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

        <ThemeToggle />
      </div>
    </header>
  );
}

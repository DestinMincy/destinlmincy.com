import Link from "next/link";

import { navItems, site } from "@/lib/site";

/**
 * Renders the site footer with branding, navigation, and contact information.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <img
            className="brand__logo"
            src="/img/dlm-logo--hex.svg"
            alt=""
            width="34"
            height="39"
            aria-hidden="true"
          />
          <div>
            <p className="site-footer__name">{site.company}</p>
            <p className="site-footer__meta">Maryville, Tennessee</p>
          </div>
        </div>

        <nav className="site-footer__nav" aria-label="Footer navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="site-footer__meta">
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>
    </footer>
  );
}

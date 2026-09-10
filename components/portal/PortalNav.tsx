"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/contracts", label: "Contracts" },
  { href: "/portal/payments", label: "Payments" },
  { href: "/portal/subscriptions", label: "Subscriptions" },
  { href: "/portal/projects", label: "Projects" },
] as const;

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="portal-nav" aria-label="Portal navigation">
      <ul className="portal-nav__list">
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive =
            href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`portal-nav__link${isActive ? " portal-nav__link--active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

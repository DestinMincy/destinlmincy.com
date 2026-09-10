import Link from "next/link";

interface SectionSummaryProps {
  title: string;
  count: number;
  href: string;
  detail?: string;
}

/** A compact panel showing a count, a section title, and a link to the full
 * section. Used in the relationship hub overview to surface section state at
 * a glance before the user navigates into the dedicated page.
 */
export function SectionSummary({
  title,
  count,
  href,
  detail,
}: SectionSummaryProps) {
  return (
    <Link className="admin-work-links__item" href={href}>
      <span>{title}</span>
      {detail ? <span className="admin-table__sub">{detail}</span> : null}
      <strong>{count}</strong>
    </Link>
  );
}

import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import { listPortalSubscriptions } from "@/lib/portal/queries";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subscriptions",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  HOSTING: "Hosting",
  MAINTENANCE: "Maintenance",
};

const SERVICE_TYPE_DESCRIPTIONS: Record<string, string> = {
  HOSTING: "Keeps your application or site live, fast, and secure.",
  MAINTENANCE:
    "Covers routine updates, dependency management, and ongoing small fixes.",
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELED: "Canceled",
  PAUSED: "Paused",
  OVERRIDDEN: "Admin override",
};

const SUBSCRIPTION_STATUS_TONE: Record<string, string> = {
  ACTIVE: "success",
  PAST_DUE: "signal",
  CANCELED: "muted",
  PAUSED: "neutral",
  OVERRIDDEN: "accent",
};

const periodDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function hasActiveAccess(
  sub: { status: string; currentPeriodEndsAt: Date | null },
  clerkEntitled: boolean,
): boolean {
  if (sub.status === "OVERRIDDEN") return true;
  if (sub.status === "ACTIVE") return clerkEntitled || true;
  if (sub.status === "CANCELED" && sub.currentPeriodEndsAt) {
    return new Date() < sub.currentPeriodEndsAt;
  }
  return false;
}

export default async function PortalSubscriptionsPage() {
  const authResult = await auth();
  const { userId, has } = authResult;
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const membership = await findClientMembershipByClerkUserId(userId);
  if (!membership) return null;

  const subscriptions = await listPortalSubscriptions(
    membership.clientRelationshipId,
  );

  return (
    <div className="container section section--tight admin-screen">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Subscriptions</p>
          <h1 className="admin-title">Active services</h1>
        </div>
      </header>

      {subscriptions.length === 0 ? (
        <div className="admin-panel admin-empty">
          <p className="admin-empty__note">No subscriptions on file.</p>
        </div>
      ) : (
        <ul className="portal-work-list admin-panel">
          {subscriptions.map((sub) => {
            const tone = SUBSCRIPTION_STATUS_TONE[sub.status] ?? "neutral";
            const label =
              SUBSCRIPTION_STATUS_LABELS[sub.status] ?? sub.status;
            const serviceLabel =
              SERVICE_TYPE_LABELS[sub.serviceType] ?? sub.serviceType;
            const serviceDesc =
              SERVICE_TYPE_DESCRIPTIONS[sub.serviceType] ?? "";

            // Check Clerk entitlement if an entitlement key is configured.
            const clerkEntitled = sub.entitlementKey
              ? (() => {
                  try {
                    return has({ feature: sub.entitlementKey });
                  } catch {
                    return false;
                  }
                })()
              : false;

            const accessActive = hasActiveAccess(sub, clerkEntitled);

            return (
              <li key={sub.id}>
                <div>
                  <strong>{serviceLabel}</strong>
                  <span>{serviceDesc}</span>
                  {sub.currentPeriodEndsAt ? (
                    <span>
                      {sub.status === "CANCELED"
                        ? "Access until "
                        : "Period ends "}
                      {periodDateFormatter.format(sub.currentPeriodEndsAt)}
                    </span>
                  ) : null}
                  {!accessActive && sub.status === "CANCELED" ? (
                    <span style={{ color: "var(--color-signal, #e53e3e)", fontSize: "0.85rem" }}>
                      Access has ended
                    </span>
                  ) : null}
                </div>
                <span className={`status-mark status-mark--${tone}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="admin-panel">
        <p className="admin-empty__note">
          To change, cancel, or ask about your subscription, email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. Changes take
          effect at the next billing period.
        </p>
      </div>
    </div>
  );
}

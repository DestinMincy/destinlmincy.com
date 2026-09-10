"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useActionState } from "react";

import type { SubscriptionFormState } from "../actions";
import { createSubscriptionAction } from "../actions";

const EMPTY_STATE: SubscriptionFormState = { status: "idle", errors: {} };

export default function NewSubscriptionPage() {
  const { id } = useParams<{ id: string }>();
  const boundAction = createSubscriptionAction.bind(null, id);
  const [state, formAction, isPending] = useActionState<
    SubscriptionFormState,
    FormData
  >(boundAction, EMPTY_STATE);

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/subscriptions`}
        >
          Subscriptions
        </Link>
      </nav>

      <header>
        <p className="eyebrow">New subscription</p>
        <h1 className="admin-title">Add a subscription</h1>
      </header>

      <div className="admin-panel">
        <form className="admin-form" action={formAction} noValidate>
          {state.formError ? (
            <p className="admin-form__error">{state.formError}</p>
          ) : null}

          <div className="admin-form__row">
            <div className="field">
              <label htmlFor="serviceType">Service type</label>
              <select id="serviceType" name="serviceType" required>
                <option value="">— Select —</option>
                <option value="HOSTING">Hosting</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              {state.errors.serviceType ? (
                <p className="field-error">{state.errors.serviceType}</p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue="ACTIVE">
                <option value="ACTIVE">Active</option>
                <option value="PAST_DUE">Past due</option>
                <option value="CANCELED">Canceled</option>
                <option value="PAUSED">Paused</option>
                <option value="OVERRIDDEN">Admin override</option>
              </select>
            </div>
          </div>

          <div className="admin-form__row">
            <div className="field">
              <label htmlFor="clerkSubscriptionId">
                Clerk subscription ID (optional)
              </label>
              <input
                id="clerkSubscriptionId"
                name="clerkSubscriptionId"
                type="text"
                placeholder="sub_xxxxxxxxxxxx"
              />
            </div>

            <div className="field">
              <label htmlFor="entitlementKey">
                Entitlement key (optional)
              </label>
              <input
                id="entitlementKey"
                name="entitlementKey"
                type="text"
                placeholder="e.g. hosting-basic"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="currentPeriodEndsAt">
              Current period end date (optional)
            </label>
            <input
              id="currentPeriodEndsAt"
              name="currentPeriodEndsAt"
              type="date"
            />
          </div>

          <div className="button-row">
            <button
              className="button button--primary"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Create subscription"}
            </button>
            <Link
              className="button button--secondary"
              href={`/admin/relationships/${id}/subscriptions`}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

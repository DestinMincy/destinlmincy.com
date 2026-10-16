"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { SubscriptionFormState } from "../../actions";
import { updateSubscriptionAction } from "../../actions";

interface EditSubscriptionFormProps {
  clientRelationshipId: string;
  subscriptionId: string;
  defaultValues: {
    status: string;
    clerkSubscriptionId: string;
    entitlementKey: string;
    currentPeriodEndsAt: string;
  };
}

const EMPTY_STATE: SubscriptionFormState = { status: "idle", errors: {} };

export function EditSubscriptionForm({
  clientRelationshipId,
  subscriptionId,
  defaultValues,
}: EditSubscriptionFormProps) {
  const boundAction = updateSubscriptionAction.bind(
    null,
    clientRelationshipId,
    subscriptionId,
  );
  const [state, formAction, isPending] = useActionState<
    SubscriptionFormState,
    FormData
  >(boundAction, EMPTY_STATE);

  return (
    <div className="admin-panel">
      <form className="admin-form" action={formAction} noValidate>
        {state.formError ? (
          <p className="admin-form__error">{state.formError}</p>
        ) : null}

        <div className="admin-form__row">
          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={defaultValues.status}
              aria-describedby={state.errors.status ? "status-error" : undefined}
            >
              <option value="ACTIVE">Active</option>
              <option value="PAST_DUE">Past due</option>
              <option value="CANCELED">Canceled</option>
              <option value="PAUSED">Paused</option>
              <option value="OVERRIDDEN">Admin override</option>
            </select>
            {state.errors.status ? (
              <span id="status-error" className="admin-form__error">
                {state.errors.status}
              </span>
            ) : null}
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
              defaultValue={defaultValues.clerkSubscriptionId}
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
              defaultValue={defaultValues.entitlementKey}
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
            defaultValue={defaultValues.currentPeriodEndsAt}
            aria-describedby={
              state.errors.currentPeriodEndsAt
                ? "currentPeriodEndsAt-error"
                : undefined
            }
          />
          {state.errors.currentPeriodEndsAt ? (
            <span id="currentPeriodEndsAt-error" className="admin-form__error">
              {state.errors.currentPeriodEndsAt}
            </span>
          ) : null}
          <p className="field-hint">
            When canceled, access continues until this date. Set to override
            default billing behavior.
          </p>
        </div>

        <div className="button-row">
          <button
            className="button button--primary"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
          <Link
            className="button button--secondary"
            href={`/admin/relationships/${clientRelationshipId}/subscriptions`}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

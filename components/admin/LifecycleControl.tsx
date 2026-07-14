"use client";

import { useActionState } from "react";

import type {
  ClientRelationshipLifecycle,
  SimpleActionState,
} from "@/lib/relationships/types";
import { LIFECYCLE_LABELS, LIFECYCLE_VALUES } from "@/lib/relationships/types";

type LifecycleAction = (
  prevState: SimpleActionState,
  formData: FormData,
) => Promise<SimpleActionState>;

interface LifecycleControlProps {
  action: LifecycleAction;
  current: ClientRelationshipLifecycle;
}

/**
 * Inline lifecycle updater for the relationship detail view. Submitting
 * persists the new state server-side and revalidates the page.
 */
export function LifecycleControl({ action, current }: LifecycleControlProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
  });

  return (
    <form className="lifecycle-form" action={formAction}>
      <label className="lifecycle-form__label" htmlFor="lifecycle-select">
        Lifecycle
      </label>
      <select
        id="lifecycle-select"
        name="lifecycle"
        key={current}
        defaultValue={current}
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "lifecycle-select-error" : undefined}
      >
        {LIFECYCLE_VALUES.map((value) => (
          <option key={value} value={value}>
            {LIFECYCLE_LABELS[value]}
          </option>
        ))}
      </select>
      <button
        className="button button--secondary button--compact"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Saving" : "Update"}
      </button>
      {state.error ? (
        <p className="field-error" id="lifecycle-select-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

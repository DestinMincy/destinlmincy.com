"use client";

import { useActionState } from "react";

import type { SimpleActionState } from "@/lib/relationships/types";

type RemoveMembershipAction = (
  prevState: SimpleActionState,
) => Promise<SimpleActionState>;

interface RemoveMembershipButtonProps {
  action: RemoveMembershipAction;
}

/**
 * Deactivates a client user's membership. Removal is reversible by
 * re-attaching the same email, so no confirmation step is required.
 */
export function RemoveMembershipButton({
  action,
}: RemoveMembershipButtonProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
  });

  return (
    <form className="remove-form" action={formAction}>
      <button className="link-button--danger" type="submit" disabled={isPending}>
        {isPending ? "Removing" : "Remove"}
      </button>
      {state.error ? (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

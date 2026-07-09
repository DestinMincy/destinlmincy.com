"use client";

import { useActionState } from "react";

import type { AttachClientUserFormState } from "@/lib/relationships/types";

type AttachClientUserAction = (
  prevState: AttachClientUserFormState,
  formData: FormData,
) => Promise<AttachClientUserFormState>;

interface AttachClientUserFormProps {
  action: AttachClientUserAction;
}

/**
 * Attaches an existing account to the relationship by email. The server
 * action resolves the email against Clerk and reports a clear field
 * error when no account exists.
 */
export function AttachClientUserForm({ action }: AttachClientUserFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    email: "",
    errors: {},
  });

  return (
    <form className="attach-form" action={formAction} noValidate>
      {state.formError ? (
        <p className="form-error" role="alert">
          {state.formError}
        </p>
      ) : null}

      <div className="attach-form__row">
        <div className="field">
          <label htmlFor="attach-email">Account email</label>
          <input
            id="attach-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="off"
            defaultValue={state.email}
            aria-invalid={state.errors.email ? true : undefined}
            aria-describedby={
              state.errors.email ? "attach-email-error" : undefined
            }
          />
        </div>
        <button
          className="button button--secondary button--compact"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Checking" : "Attach user"}
        </button>
      </div>
      {state.errors.email ? (
        <p className="field-error" id="attach-email-error">
          {state.errors.email}
        </p>
      ) : null}
    </form>
  );
}

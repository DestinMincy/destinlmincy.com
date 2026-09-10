"use client";

import { useActionState } from "react";

import { FormField } from "@/components/admin/FormField";
import type {
  DeliverableFormState,
  DeliverableFormValues,
} from "@/lib/milestones/types";

type DeliverableAction = (
  prevState: DeliverableFormState,
  formData: FormData,
) => Promise<DeliverableFormState>;

interface DeliverableFormProps {
  action: DeliverableAction;
  initialValues: DeliverableFormValues;
  cancelHref: string;
  submitLabel: string;
}

export function DeliverableForm({
  action,
  initialValues,
  cancelHref,
  submitLabel,
}: DeliverableFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    values: initialValues,
    errors: {},
  });

  const values = state.status === "idle" ? initialValues : state.values;

  return (
    <form className="admin-form" action={formAction} noValidate>
      {state.formError ? (
        <p className="form-error" role="alert">
          {state.formError}
        </p>
      ) : null}

      <FormField id="label" label="Label" error={state.errors.label}>
        {(control) => (
          <input
            {...control}
            type="text"
            required
            maxLength={200}
            defaultValue={values.label}
            placeholder="e.g. Staging environment link"
          />
        )}
      </FormField>

      <FormField id="url" label="URL (optional)" error={state.errors.url}>
        {(control) => (
          <input
            {...control}
            type="url"
            maxLength={2000}
            defaultValue={values.url}
            placeholder="https://..."
          />
        )}
      </FormField>

      <div className="button-row">
        <button
          className="button button--primary"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving" : submitLabel}
        </button>
        <a className="button button--secondary" href={cancelHref}>
          Cancel
        </a>
      </div>
    </form>
  );
}

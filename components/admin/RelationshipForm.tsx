"use client";

import { useActionState, type ReactNode } from "react";

import type {
  RelationshipFormState,
  RelationshipFormValues,
} from "@/lib/relationships/types";
import { LIFECYCLE_LABELS, LIFECYCLE_VALUES } from "@/lib/relationships/types";

type RelationshipFormAction = (
  prevState: RelationshipFormState,
  formData: FormData,
) => Promise<RelationshipFormState>;

interface RelationshipFormProps {
  action: RelationshipFormAction;
  initialValues: RelationshipFormValues;
  submitLabel: string;
}

interface FieldControlProps {
  id: string;
  name: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Shared label/control/error wrapper. The render prop receives the id,
 * name, and aria attributes the control must spread so the error text
 * stays associated with it.
 */
function FormField({ id, label, error, children }: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        name: id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error ? (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Shared create/edit form for a client relationship. Server actions own
 * validation and persistence; this component renders values and field
 * errors returned from the last submission.
 */
export function RelationshipForm({
  action,
  initialValues,
  submitLabel,
}: RelationshipFormProps) {
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

      <div className="admin-form__row">
        <FormField id="name" label="Name" error={state.errors.name}>
          {(control) => (
            <input
              {...control}
              type="text"
              required
              maxLength={120}
              defaultValue={values.name}
            />
          )}
        </FormField>

        <FormField
          id="legalName"
          label="Company or legal name"
          error={state.errors.legalName}
        >
          {(control) => (
            <input
              {...control}
              type="text"
              maxLength={200}
              defaultValue={values.legalName}
            />
          )}
        </FormField>
      </div>

      <div className="admin-form__row">
        <FormField
          id="primaryContactName"
          label="Primary contact name"
          error={state.errors.primaryContactName}
        >
          {(control) => (
            <input
              {...control}
              type="text"
              maxLength={120}
              autoComplete="off"
              defaultValue={values.primaryContactName}
            />
          )}
        </FormField>

        <FormField
          id="lifecycle"
          label="Lifecycle"
          error={state.errors.lifecycle}
        >
          {(control) => (
            <select {...control} defaultValue={values.lifecycle}>
              {LIFECYCLE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {LIFECYCLE_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <div className="admin-form__row">
        <FormField
          id="primaryContactEmail"
          label="Primary contact email"
          error={state.errors.primaryContactEmail}
        >
          {(control) => (
            <input
              {...control}
              type="email"
              maxLength={254}
              autoComplete="off"
              defaultValue={values.primaryContactEmail}
            />
          )}
        </FormField>

        <FormField
          id="primaryContactPhone"
          label="Primary contact phone"
          error={state.errors.primaryContactPhone}
        >
          {(control) => (
            <input
              {...control}
              type="tel"
              maxLength={40}
              autoComplete="off"
              defaultValue={values.primaryContactPhone}
            />
          )}
        </FormField>
      </div>

      <FormField
        id="summary"
        label="Notes and status summary"
        error={state.errors.summary}
      >
        {(control) => (
          <textarea
            {...control}
            rows={5}
            maxLength={2000}
            defaultValue={values.summary}
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
      </div>
    </form>
  );
}

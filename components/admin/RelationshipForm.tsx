"use client";

import { useActionState } from "react";

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
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            defaultValue={values.name}
            aria-invalid={state.errors.name ? true : undefined}
            aria-describedby={state.errors.name ? "name-error" : undefined}
          />
          {state.errors.name ? (
            <p className="field-error" id="name-error">
              {state.errors.name}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="legalName">Company or legal name</label>
          <input
            id="legalName"
            name="legalName"
            type="text"
            maxLength={200}
            defaultValue={values.legalName}
            aria-invalid={state.errors.legalName ? true : undefined}
            aria-describedby={
              state.errors.legalName ? "legalName-error" : undefined
            }
          />
          {state.errors.legalName ? (
            <p className="field-error" id="legalName-error">
              {state.errors.legalName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="admin-form__row">
        <div className="field">
          <label htmlFor="primaryContactName">Primary contact name</label>
          <input
            id="primaryContactName"
            name="primaryContactName"
            type="text"
            maxLength={120}
            autoComplete="off"
            defaultValue={values.primaryContactName}
            aria-invalid={state.errors.primaryContactName ? true : undefined}
            aria-describedby={
              state.errors.primaryContactName
                ? "primaryContactName-error"
                : undefined
            }
          />
          {state.errors.primaryContactName ? (
            <p className="field-error" id="primaryContactName-error">
              {state.errors.primaryContactName}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="lifecycle">Lifecycle</label>
          <select
            id="lifecycle"
            name="lifecycle"
            defaultValue={values.lifecycle}
            aria-invalid={state.errors.lifecycle ? true : undefined}
            aria-describedby={
              state.errors.lifecycle ? "lifecycle-error" : undefined
            }
          >
            {LIFECYCLE_VALUES.map((value) => (
              <option key={value} value={value}>
                {LIFECYCLE_LABELS[value]}
              </option>
            ))}
          </select>
          {state.errors.lifecycle ? (
            <p className="field-error" id="lifecycle-error">
              {state.errors.lifecycle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="admin-form__row">
        <div className="field">
          <label htmlFor="primaryContactEmail">Primary contact email</label>
          <input
            id="primaryContactEmail"
            name="primaryContactEmail"
            type="email"
            maxLength={254}
            autoComplete="off"
            defaultValue={values.primaryContactEmail}
            aria-invalid={state.errors.primaryContactEmail ? true : undefined}
            aria-describedby={
              state.errors.primaryContactEmail
                ? "primaryContactEmail-error"
                : undefined
            }
          />
          {state.errors.primaryContactEmail ? (
            <p className="field-error" id="primaryContactEmail-error">
              {state.errors.primaryContactEmail}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="primaryContactPhone">Primary contact phone</label>
          <input
            id="primaryContactPhone"
            name="primaryContactPhone"
            type="tel"
            maxLength={40}
            autoComplete="off"
            defaultValue={values.primaryContactPhone}
            aria-invalid={state.errors.primaryContactPhone ? true : undefined}
            aria-describedby={
              state.errors.primaryContactPhone
                ? "primaryContactPhone-error"
                : undefined
            }
          />
          {state.errors.primaryContactPhone ? (
            <p className="field-error" id="primaryContactPhone-error">
              {state.errors.primaryContactPhone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="summary">Notes and status summary</label>
        <textarea
          id="summary"
          name="summary"
          rows={5}
          maxLength={2000}
          defaultValue={values.summary}
          aria-invalid={state.errors.summary ? true : undefined}
          aria-describedby={state.errors.summary ? "summary-error" : undefined}
        />
        {state.errors.summary ? (
          <p className="field-error" id="summary-error">
            {state.errors.summary}
          </p>
        ) : null}
      </div>

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

"use client";

import { useActionState } from "react";

import { FormField } from "@/components/admin/FormField";
import type {
  ApplicationSiteFormState,
  ApplicationSiteFormValues,
} from "@/lib/client-work/types";
import {
  APPLICATION_SITE_TYPE_LABELS,
  APPLICATION_SITE_TYPE_VALUES,
} from "@/lib/client-work/types";

type ApplicationSiteFormAction = (
  prevState: ApplicationSiteFormState,
  formData: FormData,
) => Promise<ApplicationSiteFormState>;

interface ApplicationSiteFormProps {
  action: ApplicationSiteFormAction;
  initialValues: ApplicationSiteFormValues;
  submitLabel: string;
}

export function ApplicationSiteForm({
  action,
  initialValues,
  submitLabel,
}: ApplicationSiteFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    values: initialValues,
    errors: {},
  });
  const values = state.status === "idle" ? initialValues : state.values;
  const formKey = state.status === "idle" ? "idle" : JSON.stringify(values);

  return (
    <form
      key={formKey}
      className="admin-form"
      action={formAction}
      noValidate
    >
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

        <FormField id="type" label="Type" error={state.errors.type}>
          {(control) => (
            <select {...control} defaultValue={values.type}>
              {APPLICATION_SITE_TYPE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {APPLICATION_SITE_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <FormField
        id="productionUrl"
        label="Production URL"
        error={state.errors.productionUrl}
      >
        {(control) => (
          <input
            {...control}
            type="url"
            inputMode="url"
            maxLength={2048}
            placeholder="https://example.com"
            defaultValue={values.productionUrl}
          />
        )}
      </FormField>

      <div className="admin-form__row">
        <FormField
          id="stagingUrl"
          label="Staging URL"
          error={state.errors.stagingUrl}
        >
          {(control) => (
            <input
              {...control}
              type="url"
              inputMode="url"
              maxLength={2048}
              placeholder="https://staging.example.com"
              defaultValue={values.stagingUrl}
            />
          )}
        </FormField>

        <FormField
          id="repositoryUrl"
          label="Repository URL"
          error={state.errors.repositoryUrl}
        >
          {(control) => (
            <input
              {...control}
              type="url"
              inputMode="url"
              maxLength={2048}
              placeholder="https://github.com/org/repository"
              defaultValue={values.repositoryUrl}
            />
          )}
        </FormField>
      </div>

      <FormField id="notes" label="Internal notes" error={state.errors.notes}>
        {(control) => (
          <textarea
            {...control}
            rows={6}
            maxLength={4000}
            defaultValue={values.notes}
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

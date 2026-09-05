"use client";

import { useActionState } from "react";

import { FormField } from "@/components/admin/FormField";
import type {
  ApplicationSiteStatus,
  ProjectFormState,
  ProjectFormValues,
} from "@/lib/client-work/types";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_VALUES,
} from "@/lib/client-work/types";

type ProjectFormAction = (
  prevState: ProjectFormState,
  formData: FormData,
) => Promise<ProjectFormState>;

interface ApplicationSiteOption {
  id: string;
  name: string;
  status: ApplicationSiteStatus;
}

interface ProjectFormProps {
  action: ProjectFormAction;
  applicationSites: ApplicationSiteOption[];
  initialValues: ProjectFormValues;
  submitLabel: string;
}

export function ProjectForm({
  action,
  applicationSites,
  initialValues,
  submitLabel,
}: ProjectFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    values: initialValues,
    errors: {},
  });
  const values = state.status === "idle" ? initialValues : state.values;
  const formKey = state.status === "idle" ? "idle" : JSON.stringify(values);
  const createsNewAssetErrorId = "createsNewAsset-error";

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

        <FormField id="status" label="Status" error={state.errors.status}>
          {(control) => (
            <select {...control} defaultValue={values.status}>
              {PROJECT_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {PROJECT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <FormField
        id="applicationSiteId"
        label="Existing application or site"
        error={state.errors.applicationSiteId}
      >
        {(control) => (
          <select {...control} defaultValue={values.applicationSiteId}>
            <option value="">None</option>
            {applicationSites.map((application) => (
              <option key={application.id} value={application.id}>
                {application.name}
                {application.status === "ARCHIVED" ? " (archived)" : ""}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className="field checkbox-field-wrap">
        <label className="checkbox-field" htmlFor="createsNewAsset">
          <input
            id="createsNewAsset"
            name="createsNewAsset"
            type="checkbox"
            defaultChecked={values.createsNewAsset}
            aria-invalid={state.errors.createsNewAsset ? true : undefined}
            aria-describedby={
              state.errors.createsNewAsset ? createsNewAssetErrorId : undefined
            }
          />
          <span>This project creates a new application or site</span>
        </label>
        {state.errors.createsNewAsset ? (
          <p className="field-error" id={createsNewAssetErrorId} role="alert">
            {state.errors.createsNewAsset}
          </p>
        ) : null}
      </div>

      <div className="admin-form__row">
        <FormField id="startsAt" label="Start date" error={state.errors.startsAt}>
          {(control) => (
            <input {...control} type="date" defaultValue={values.startsAt} />
          )}
        </FormField>

        <FormField
          id="targetDate"
          label="Target date"
          error={state.errors.targetDate}
        >
          {(control) => (
            <input {...control} type="date" defaultValue={values.targetDate} />
          )}
        </FormField>
      </div>

      <FormField
        id="clientDescription"
        label="Client-facing description"
        error={state.errors.clientDescription}
      >
        {(control) => (
          <textarea
            {...control}
            rows={5}
            maxLength={2000}
            defaultValue={values.clientDescription}
          />
        )}
      </FormField>

      <FormField
        id="summary"
        label="Internal summary"
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

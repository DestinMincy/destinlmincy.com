"use client";

import { useActionState } from "react";

import { FormField } from "@/components/admin/FormField";
import type {
  MilestoneFormState,
  MilestoneFormValues,
} from "@/lib/milestones/types";
import {
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_VALUES,
} from "@/lib/milestones/types";

type MilestoneAction = (
  prevState: MilestoneFormState,
  formData: FormData,
) => Promise<MilestoneFormState>;

interface MilestoneFormProps {
  action: MilestoneAction;
  initialValues: MilestoneFormValues;
  submitLabel: string;
}

export function MilestoneForm({
  action,
  initialValues,
  submitLabel,
}: MilestoneFormProps) {
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

      <FormField id="title" label="Title" error={state.errors.title}>
        {(control) => (
          <input
            {...control}
            type="text"
            required
            maxLength={200}
            defaultValue={values.title}
          />
        )}
      </FormField>

      <div className="admin-form__row">
        <FormField id="status" label="Status" error={state.errors.status}>
          {(control) => (
            <select {...control} defaultValue={values.status}>
              {MILESTONE_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {MILESTONE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          id="targetDate"
          label="Target date"
          error={state.errors.targetDate}
        >
          {(control) => (
            <input
              {...control}
              type="date"
              defaultValue={values.targetDate}
            />
          )}
        </FormField>
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

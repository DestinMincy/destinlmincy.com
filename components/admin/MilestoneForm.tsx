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

export interface PaymentGateOption {
  id: string;
  label: string;
}

interface MilestoneFormProps {
  action: MilestoneAction;
  initialValues: MilestoneFormValues;
  paymentGates: PaymentGateOption[];
  submitLabel: string;
}

export function MilestoneForm({
  action,
  initialValues,
  paymentGates,
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

      <FormField
        id="clientFacingUpdate"
        label="Client-facing update"
        error={state.errors.clientFacingUpdate}
      >
        {(control) => (
          <textarea
            {...control}
            rows={3}
            defaultValue={values.clientFacingUpdate}
            placeholder="What clients see in the portal about this milestone"
          />
        )}
      </FormField>

      <div className="admin-form__row">
        <FormField
          id="paymentDependencyId"
          label="Payment dependency (optional)"
          error={state.errors.paymentDependencyId}
        >
          {(control) => (
            <select {...control} defaultValue={values.paymentDependencyId}>
              <option value="">No dependency</option>
              {paymentGates.map((gate) => (
                <option key={gate.id} value={gate.id}>
                  {gate.label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          id="approvalRequired"
          label="Client approval"
          error={state.errors.approvalRequired}
        >
          {(control) => (
            <label className="checkbox-label">
              <input
                id={control.id}
                name={control.name}
                type="checkbox"
                value="true"
                defaultChecked={values.approvalRequired}
              />
              Require client approval before proceeding
            </label>
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

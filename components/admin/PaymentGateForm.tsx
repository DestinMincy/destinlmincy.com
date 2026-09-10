"use client";

import { useActionState } from "react";

import { FormField } from "@/components/admin/FormField";
import type {
  PaymentGateFormState,
  PaymentGateFormValues,
} from "@/lib/payment-gates/types";
import { PAYMENT_GATE_STATUS_LABELS, PAYMENT_GATE_STATUS_VALUES } from "@/lib/payment-gates/types";

type PaymentGateAction = (
  prevState: PaymentGateFormState,
  formData: FormData,
) => Promise<PaymentGateFormState>;

interface ProjectOption {
  id: string;
  name: string;
}

interface PaymentGateFormProps {
  action: PaymentGateAction;
  initialValues: PaymentGateFormValues;
  projects: ProjectOption[];
  submitLabel: string;
}

export function PaymentGateForm({
  action,
  initialValues,
  projects,
  submitLabel,
}: PaymentGateFormProps) {
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
        <FormField id="label" label="Label" error={state.errors.label}>
          {(control) => (
            <input
              {...control}
              type="text"
              required
              maxLength={200}
              defaultValue={values.label}
              placeholder="e.g. 50% deposit"
            />
          )}
        </FormField>

        <FormField id="status" label="Status" error={state.errors.status}>
          {(control) => (
            <select {...control} defaultValue={values.status}>
              {PAYMENT_GATE_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {PAYMENT_GATE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <FormField
        id="projectId"
        label="Project (optional)"
        error={state.errors.projectId}
      >
        {(control) => (
          <select {...control} defaultValue={values.projectId}>
            <option value="">None</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
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

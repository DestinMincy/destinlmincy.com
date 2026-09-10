"use client";

import { useActionState } from "react";

import { FormField } from "@/components/admin/FormField";
import type {
  PaymentGateFormState,
  PaymentGateFormValues,
} from "@/lib/payment-gates/types";
import {
  PAYMENT_GATE_STATUS_LABELS,
  PAYMENT_GATE_STATUS_VALUES,
  PAYMENT_GATE_TYPE_LABELS,
  PAYMENT_GATE_TYPE_VALUES,
} from "@/lib/payment-gates/types";

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

      <div className="admin-form__row">
        <FormField
          id="paymentType"
          label="Payment type"
          error={state.errors.paymentType}
        >
          {(control) => (
            <select {...control} defaultValue={values.paymentType}>
              {PAYMENT_GATE_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>
                  {PAYMENT_GATE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          )}
        </FormField>

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
      </div>

      <div className="admin-form__row">
        <FormField
          id="amount"
          label="Amount (optional)"
          error={state.errors.amount}
        >
          {(control) => (
            <input
              {...control}
              type="number"
              min="0"
              step="0.01"
              defaultValue={values.amount}
              placeholder="e.g. 1500.00"
            />
          )}
        </FormField>

        <FormField
          id="currency"
          label="Currency"
          error={state.errors.currency}
        >
          {(control) => (
            <input
              {...control}
              type="text"
              maxLength={3}
              defaultValue={values.currency}
              placeholder="USD"
            />
          )}
        </FormField>
      </div>

      <div className="admin-form__row">
        <FormField
          id="dueDate"
          label="Due date (optional)"
          error={state.errors.dueDate}
        >
          {(control) => (
            <input
              {...control}
              type="date"
              defaultValue={values.dueDate}
            />
          )}
        </FormField>

        <FormField
          id="requiredBeforeWork"
          label="Required before work begins"
          error={state.errors.requiredBeforeWork}
        >
          {(control) => (
            <label className="checkbox-label">
              <input
                id={control.id}
                name={control.name}
                type="checkbox"
                value="true"
                defaultChecked={values.requiredBeforeWork}
              />
              Payment must be received before work starts
            </label>
          )}
        </FormField>
      </div>

      <div className="admin-form__row">
        <FormField
          id="stripeUrl"
          label="Stripe URL (optional)"
          error={state.errors.stripeUrl}
        >
          {(control) => (
            <input
              {...control}
              type="url"
              defaultValue={values.stripeUrl}
              placeholder="https://invoice.stripe.com/i/..."
            />
          )}
        </FormField>

        <FormField
          id="stripeId"
          label="Stripe invoice / payment link ID (optional)"
          error={state.errors.stripeId}
        >
          {(control) => (
            <input
              {...control}
              type="text"
              defaultValue={values.stripeId}
              placeholder="in_... or plink_..."
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

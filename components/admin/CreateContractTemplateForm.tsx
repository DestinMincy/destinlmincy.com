"use client";

import { useActionState } from "react";

import { FormField } from "@/components/admin/FormField";
import type { CreateTemplateFormState } from "@/lib/contracts/types";
import { EMPTY_CREATE_TEMPLATE_VALUES } from "@/lib/contracts/types";

type CreateTemplateAction = (
  prevState: CreateTemplateFormState,
  formData: FormData,
) => Promise<CreateTemplateFormState>;

interface CreateContractTemplateFormProps {
  action: CreateTemplateAction;
  cancelHref: string;
}

export function CreateContractTemplateForm({
  action,
  cancelHref,
}: CreateContractTemplateFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    values: EMPTY_CREATE_TEMPLATE_VALUES,
    errors: {},
  });

  const values =
    state.status === "idle" ? EMPTY_CREATE_TEMPLATE_VALUES : state.values;

  return (
    <form className="admin-form" action={formAction} noValidate>
      {state.formError ? (
        <p className="form-error" role="alert">
          {state.formError}
        </p>
      ) : null}

      <FormField id="name" label="Template name" error={state.errors.name}>
        {(control) => (
          <input
            {...control}
            type="text"
            required
            maxLength={200}
            autoFocus
            defaultValue={values.name}
          />
        )}
      </FormField>

      <div className="button-row">
        <button
          className="button button--primary"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Creating" : "Create template"}
        </button>
        <a className="button button--secondary" href={cancelHref}>
          Cancel
        </a>
      </div>
    </form>
  );
}

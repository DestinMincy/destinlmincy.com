"use client";

import Link from "next/link";
import { useActionState } from "react";

import type {
  GenerateContractState,
  TemplateVariable,
} from "@/lib/contracts/types";

type GenerateContractAction = (
  prevState: GenerateContractState,
  formData: FormData,
) => Promise<GenerateContractState>;

interface GenerateContractFormProps {
  action: GenerateContractAction;
  versions: { id: string; versionNumber: number }[];
  variables: TemplateVariable[];
  cancelHref: string;
}

export function GenerateContractForm({
  action,
  versions,
  variables,
  cancelHref,
}: GenerateContractFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
  });
  const values = state.values;

  return (
    <form className="admin-form" action={formAction} noValidate>
      {state.status === "error" && state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="admin-form__row">
        <div className="field">
          <label htmlFor="versionId">Version</label>
          <select
            id="versionId"
            name="versionId"
            defaultValue={values?.versionId ?? versions[0]?.id}
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                v{version.versionNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="signerEmail">Signer email (required)</label>
          <input
            id="signerEmail"
            name="signerEmail"
            type="email"
            required
            placeholder="client@example.com"
            defaultValue={values?.signerEmail ?? ""}
          />
        </div>
      </div>

      {variables.length > 0 ? (
        <fieldset className="admin-panel">
          <legend className="admin-panel__title">Contract variables</legend>
          <div className="admin-form">
            {variables.map((variable) => (
              <div className="field" key={variable.key}>
                <label htmlFor={`var-${variable.key}`}>
                  {variable.label || variable.key}
                  {variable.required ? " (required)" : " (optional)"}
                </label>
                <input
                  id={`var-${variable.key}`}
                  name={`var_${variable.key}`}
                  type="text"
                  required={variable.required}
                  defaultValue={values?.fields[variable.key] ?? ""}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="button-row">
        <button
          className="button button--primary"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Generating" : "Generate contract"}
        </button>
        <Link className="button button--secondary" href={cancelHref}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

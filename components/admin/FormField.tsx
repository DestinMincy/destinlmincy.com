"use client";

import type { ReactNode } from "react";

interface FieldControlProps {
  id: string;
  name?: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
}

interface FormFieldProps {
  id: string;
  name?: string;
  label: string;
  error?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Shared label/control/error wrapper for admin forms. The render prop
 * receives the id, name, and aria attributes the control must spread so
 * the error text stays associated with it. The submitted field name
 * defaults to the id; pass `name` when the two must differ.
 */
export function FormField({ id, name, label, error, children }: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        name: name ?? id,
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

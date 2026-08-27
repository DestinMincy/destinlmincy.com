"use client";

import { useActionState } from "react";

import {
  IDLE_ARCHIVE_ACTION_STATE,
  type ArchiveActionState,
} from "@/lib/client-work/types";

type ArchiveAction = (
  prevState: ArchiveActionState,
  formData: FormData,
) => Promise<ArchiveActionState>;

interface ArchiveButtonProps {
  action: ArchiveAction;
  label: string;
}

export function ArchiveButton({ action, label }: ArchiveButtonProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    IDLE_ARCHIVE_ACTION_STATE,
  );

  return (
    <form className="archive-form" action={formAction}>
      <button
        className="link-button--danger"
        type="submit"
        disabled={isPending}
        aria-label={`Archive ${label}`}
      >
        {isPending ? "Archiving" : "Archive"}
      </button>
      {state.error ? (
        <span className="field-error" role="alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

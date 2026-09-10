"use client";

import { useActionState } from "react";

import type { SendToDocuSignState } from "@/lib/contracts/actions";
import { sendContractToDocuSignAction } from "@/lib/contracts/actions";

interface SendToDocuSignButtonProps {
  clientRelationshipId: string;
  contractId: string;
}

export function SendToDocuSignButton({
  clientRelationshipId,
  contractId,
}: SendToDocuSignButtonProps) {
  const boundAction = sendContractToDocuSignAction.bind(
    null,
    clientRelationshipId,
    contractId,
  );

  const [state, formAction, isPending] = useActionState<SendToDocuSignState, FormData>(
    boundAction,
    { status: "idle" },
  );

  if (state.status === "success") {
    return <span className="status-mark status-mark--success">Sent</span>;
  }

  return (
    <form action={formAction}>
      {state.status === "error" ? (
        <p className="admin-form__error" style={{ marginBottom: 4 }}>
          {state.error}
        </p>
      ) : null}
      <button
        className="button button--secondary"
        type="submit"
        disabled={isPending}
        style={{ fontSize: "0.8rem", padding: "4px 10px" }}
      >
        {isPending ? "Sending…" : "Send for signing"}
      </button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";

import {
  approveMilestoneAction,
  requestMilestoneChangesAction,
} from "@/lib/portal/actions";

interface ApprovalFormProps {
  milestoneId: string;
  clientRelationshipId: string;
}

type FormState = "idle" | "requesting-changes" | "submitted";

export function ApprovalForm({
  milestoneId,
  clientRelationshipId,
}: ApprovalFormProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveMilestoneAction(
        milestoneId,
        clientRelationshipId,
      );
      if (result.success) {
        setFormState("submitted");
        setMessage("Milestone approved.");
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  function handleRequestChanges() {
    if (!notes.trim()) {
      setError("Please describe the changes you need.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await requestMilestoneChangesAction(
        milestoneId,
        clientRelationshipId,
        notes,
      );
      if (result.success) {
        setFormState("submitted");
        setMessage("Change request sent.");
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  if (formState === "submitted") {
    return (
      <p className="portal-approval__confirm" role="status">
        {message}
      </p>
    );
  }

  return (
    <div className="portal-approval">
      {formState === "idle" ? (
        <div className="portal-approval__actions">
          <button
            className="button button--primary button--compact"
            onClick={handleApprove}
            disabled={isPending}
            type="button"
          >
            Approve
          </button>
          <button
            className="button button--secondary button--compact"
            onClick={() => {
              setError(null);
              setFormState("requesting-changes");
            }}
            disabled={isPending}
            type="button"
          >
            Request changes
          </button>
        </div>
      ) : (
        <div className="portal-approval__change-form">
          <label htmlFor={`notes-${milestoneId}`} className="portal-approval__label">
            Describe what needs to change
          </label>
          <textarea
            id={`notes-${milestoneId}`}
            rows={4}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="portal-approval__textarea"
            disabled={isPending}
          />
          <div className="portal-approval__actions">
            <button
              className="button button--primary button--compact"
              onClick={handleRequestChanges}
              disabled={isPending}
              type="button"
            >
              Send change request
            </button>
            <button
              className="button button--secondary button--compact"
              onClick={() => {
                setFormState("idle");
                setError(null);
              }}
              disabled={isPending}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

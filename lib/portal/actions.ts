"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import { addMilestoneApproval } from "@/lib/milestones/queries";

async function getAuthenticatedClientMembership(
  clientRelationshipId: string,
): Promise<
  | { ok: true; clerkUserId: string; actorName: string | null }
  | { ok: false; error: string }
> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  const membership = await findClientMembershipByClerkUserId(userId);
  if (!membership || membership.clientRelationshipId !== clientRelationshipId) {
    return { ok: false, error: "You do not have access to this relationship." };
  }

  const user = await currentUser();
  const actorName =
    user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      : null;

  return { ok: true, clerkUserId: userId, actorName };
}

export interface MilestoneApprovalState {
  status: "idle" | "error" | "success";
  error?: string;
}

export interface MilestoneChangesRequestState {
  status: "idle" | "error" | "success";
  errors: Partial<Record<"note", string>>;
  formError?: string;
}

/**
 * Approves a milestone on behalf of the authenticated client user.
 * The user must belong to the clientRelationshipId.
 */
export async function approveMilestone(
  milestoneId: string,
  clientRelationshipId: string,
): Promise<MilestoneApprovalState> {
  const auth = await getAuthenticatedClientMembership(clientRelationshipId);
  if (!auth.ok) {
    return { status: "error", error: auth.error };
  }

  try {
    await addMilestoneApproval({
      milestoneId,
      clientRelationshipId,
      actorClerkUserId: auth.clerkUserId,
      actorName: auth.actorName,
      action: "APPROVED",
    });
  } catch (error: unknown) {
    console.error("Failed to record milestone approval", error);
    return { status: "error", error: "Something went wrong. Try again." };
  }

  revalidatePath(`/portal/projects`);
  return { status: "success" };
}

/**
 * Records a changes-requested action on a milestone on behalf of the
 * authenticated client user. Requires a note explaining what changes
 * are needed.
 */
export async function requestMilestoneChanges(
  milestoneId: string,
  clientRelationshipId: string,
  _prevState: MilestoneChangesRequestState,
  formData: FormData,
): Promise<MilestoneChangesRequestState> {
  const membership = await getAuthenticatedClientMembership(clientRelationshipId);
  if (!membership.ok) {
    return { status: "error", errors: {}, formError: membership.error };
  }

  const rawNote = formData.get("note");
  const note = typeof rawNote === "string" ? rawNote.trim() : "";

  if (!note) {
    return {
      status: "error",
      errors: { note: "A note explaining the requested changes is required." },
    };
  }

  try {
    await addMilestoneApproval({
      milestoneId,
      clientRelationshipId,
      actorClerkUserId: membership.clerkUserId,
      actorName: membership.actorName,
      action: "CHANGES_REQUESTED",
      note,
    });
  } catch (error: unknown) {
    console.error("Failed to record milestone changes request", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong. Try again.",
    };
  }

  revalidatePath(`/portal/projects`);
  return { status: "success", errors: {} };
}

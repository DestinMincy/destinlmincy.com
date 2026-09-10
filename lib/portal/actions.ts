"use server";

// Milestone approval server actions.
// The milestone model does not yet carry approvalRequired/clientFacingUpdate
// fields; these stubs will be wired to real DB writes when the schema migration
// lands in the backend unit.

export async function approveMilestoneAction(
  milestoneId: string,
  clientRelationshipId: string,
): Promise<{ success: boolean; error?: string }> {
  // TODO: update milestone approval record in db when schema supports it
  console.log(
    "approveMilestone stub",
    milestoneId,
    clientRelationshipId,
  );
  return { success: true };
}

export async function requestMilestoneChangesAction(
  milestoneId: string,
  clientRelationshipId: string,
  notes: string,
): Promise<{ success: boolean; error?: string }> {
  // TODO: update milestone change-request record in db when schema supports it
  console.log(
    "requestMilestoneChanges stub",
    milestoneId,
    clientRelationshipId,
    notes,
  );
  return { success: true };
}

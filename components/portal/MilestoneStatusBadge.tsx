import type { MilestoneStatus } from "@/lib/generated/prisma/enums";

const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  COMPLETE: "Complete",
};

const MILESTONE_STATUS_TONE: Record<MilestoneStatus, string> = {
  PLANNED: "neutral",
  IN_PROGRESS: "accent",
  BLOCKED: "signal",
  COMPLETE: "success",
};

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const tone = MILESTONE_STATUS_TONE[status];
  return (
    <span className={`status-mark status-mark--${tone}`}>
      {MILESTONE_STATUS_LABELS[status]}
    </span>
  );
}

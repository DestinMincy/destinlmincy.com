import type { ClientRelationshipLifecycle } from "@/lib/relationships/types";
import { LIFECYCLE_LABELS, LIFECYCLE_TONE } from "@/lib/relationships/types";

interface LifecycleBadgeProps {
  lifecycle: ClientRelationshipLifecycle;
}

/**
 * Lifecycle state label with a small hex marker. The hex is the brand's
 * signature accent; dashboards stay rectangular otherwise.
 */
export function LifecycleBadge({ lifecycle }: LifecycleBadgeProps) {
  return (
    <span className={`status-mark status-mark--${LIFECYCLE_TONE[lifecycle]}`}>
      {LIFECYCLE_LABELS[lifecycle]}
    </span>
  );
}

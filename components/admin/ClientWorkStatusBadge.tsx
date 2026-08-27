import type {
  ApplicationSiteStatus,
  ProjectStatus,
} from "@/lib/client-work/types";
import {
  APPLICATION_SITE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_TONE,
} from "@/lib/client-work/types";

export function ApplicationSiteStatusBadge({
  status,
}: {
  status: ApplicationSiteStatus;
}) {
  const tone = status === "ACTIVE" ? "success" : "muted";
  return (
    <span className={`status-mark status-mark--${tone}`}>
      {APPLICATION_SITE_STATUS_LABELS[status]}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`status-mark status-mark--${PROJECT_STATUS_TONE[status]}`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

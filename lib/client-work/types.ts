import type {
  ApplicationSiteStatus,
  ApplicationSiteType,
  ProjectStatus,
} from "@/lib/generated/prisma/enums";
import {
  ApplicationSiteStatus as SiteStatus,
  ApplicationSiteType as SiteType,
  ProjectStatus as WorkStatus,
} from "@/lib/generated/prisma/enums";

export type { ApplicationSiteStatus, ApplicationSiteType, ProjectStatus };

export const APPLICATION_SITE_TYPE_VALUES: ApplicationSiteType[] =
  Object.values(SiteType);

export const APPLICATION_SITE_TYPE_LABELS: Record<
  ApplicationSiteType,
  string
> = {
  WEBSITE: "Website",
  WEB_APPLICATION: "Web application",
  INTERNAL_TOOL: "Internal tool",
  OTHER: "Other",
};

export const APPLICATION_SITE_STATUS_LABELS: Record<
  ApplicationSiteStatus,
  string
> = {
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const PROJECT_STATUS_VALUES: ProjectStatus[] = Object.values(WorkStatus);

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const PROJECT_STATUS_TONE: Record<
  ProjectStatus,
  "neutral" | "signal" | "success" | "muted"
> = {
  PLANNED: "neutral",
  IN_PROGRESS: "signal",
  PAUSED: "muted",
  COMPLETED: "success",
  ARCHIVED: "muted",
};

export interface ApplicationSiteFormValues {
  name: string;
  type: ApplicationSiteType;
  productionUrl: string;
  stagingUrl: string;
  repositoryUrl: string;
  notes: string;
}

export type ApplicationSiteFieldName = keyof ApplicationSiteFormValues;

export interface ApplicationSiteFormState {
  status: "idle" | "error";
  values: ApplicationSiteFormValues;
  errors: Partial<Record<ApplicationSiteFieldName, string>>;
  formError?: string;
}

export const EMPTY_APPLICATION_SITE_FORM_VALUES: ApplicationSiteFormValues = {
  name: "",
  type: "WEBSITE",
  productionUrl: "",
  stagingUrl: "",
  repositoryUrl: "",
  notes: "",
} as const;

export interface ProjectFormValues {
  name: string;
  status: ProjectStatus;
  applicationSiteId: string;
  createsNewAsset: boolean;
  summary: string;
  clientDescription: string;
  startsAt: string;
  targetDate: string;
}

export type ProjectFieldName = keyof ProjectFormValues;

export interface ProjectFormState {
  status: "idle" | "error";
  values: ProjectFormValues;
  errors: Partial<Record<ProjectFieldName, string>>;
  formError?: string;
}

export const EMPTY_PROJECT_FORM_VALUES: ProjectFormValues = {
  name: "",
  status: "PLANNED",
  applicationSiteId: "",
  createsNewAsset: false,
  summary: "",
  clientDescription: "",
  startsAt: "",
  targetDate: "",
} as const;

export interface ArchiveActionState {
  status: "idle" | "error";
  error?: string;
}

export const IDLE_ARCHIVE_ACTION_STATE: ArchiveActionState = {
  status: "idle",
} as const;

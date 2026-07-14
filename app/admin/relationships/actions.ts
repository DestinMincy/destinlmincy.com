"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  AttachClientUserFormState,
  RelationshipFormState,
  SimpleActionState,
} from "@/lib/relationships/types";
import {
  isLifecycleValue,
  isValidEmail,
  parseRelationshipForm,
  slugifyRelationshipName,
  SLUG_MAX_LENGTH,
} from "@/lib/relationships/validation";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const RELATIONSHIPS_PATH = "/admin/relationships";
const MAX_EMAIL_LENGTH = 254;
const MAX_SLUG_ATTEMPTS = 3;
const ALREADY_ATTACHED =
  "That person is already attached to this relationship.";

function relationshipPath(id: string): string {
  return `${RELATIONSHIPS_PATH}/${id}`;
}

type RelationshipFormValues = ReturnType<typeof parseRelationshipForm>["values"];

function relationshipDataFromValues(
  values: RelationshipFormValues,
): Prisma.ClientRelationshipCreateInput | Prisma.ClientRelationshipUpdateInput {
  return {
    name: values.name,
    lifecycle: values.lifecycle,
    legalName: values.legalName || null,
    primaryContactName: values.primaryContactName || null,
    primaryContactEmail: values.primaryContactEmail || null,
    primaryContactPhone: values.primaryContactPhone || null,
    summary: values.summary || null,
  };
}

function isUniqueConstraintError(
  error: unknown,
  ...fields: string[]
): boolean {
  if (
    !(
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
  ) {
    return false;
  }

  if (fields.length === 0) {
    return true;
  }

  const target = String(error.meta?.target ?? "");
  return fields.some((field) => target.includes(field));
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/**
 * Picks a slug that is not already taken, appending a numeric suffix
 * when the base candidate collides with existing relationships.
 *
 * Candidate lookup is intentionally field-exact: near SLUG_MAX_LENGTH,
 * truncating the suffix can change the prefix, so candidate uniqueness
 * must be proven by the exact string rather than a broad startsWith query.
 */
async function resolveUniqueSlug(name: string): Promise<string> {
  const base = slugifyRelationshipName(name);

  if (base.length <= SLUG_MAX_LENGTH) {
    const existing = await prisma.clientRelationship.findUnique({
      where: { slug: base },
      select: { id: true },
    });
    if (!existing) {
      return base;
    }
  }

  for (let suffix = 2; suffix <= 100; suffix += 1) {
    const suffixText = `-${suffix}`;
    const candidate =
      base.length + suffixText.length <= SLUG_MAX_LENGTH
        ? `${base}${suffixText}`
        : `${base.slice(0, SLUG_MAX_LENGTH - suffixText.length)}${suffixText}`;

    const existing = await prisma.clientRelationship.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Could not resolve a unique slug");
}

export async function createRelationshipAction(
  _prevState: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parseRelationshipForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  let createdId: string | null = null;

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
    try {
      const created = await prisma.clientRelationship.create({
        data: {
          ...relationshipDataFromValues(values),
          slug: await resolveUniqueSlug(values.name),
        },
        select: { id: true },
      });
      createdId = created.id;
      break;
    } catch (error: unknown) {
      // A concurrent create can claim the candidate slug between the
      // uniqueness read and this insert. Re-resolving against fresh
      // data on the next attempt absorbs the collision without making
      // the user retry manually.
      if (isUniqueConstraintError(error, "slug") && attempt < MAX_SLUG_ATTEMPTS) {
        continue;
      }
      console.error("Failed to create client relationship", error);
      return {
        status: "error",
        values,
        errors: {},
        formError: "Something went wrong while saving. Try again.",
      };
    }
  }

  if (createdId === null) {
    return {
      status: "error",
      values,
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(RELATIONSHIPS_PATH);
  redirect(relationshipPath(createdId));
}

export async function updateRelationshipAction(
  relationshipId: string,
  _prevState: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parseRelationshipForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  try {
    await prisma.clientRelationship.update({
      where: { id: relationshipId },
      data: relationshipDataFromValues(values),
      select: { id: true },
    });
  } catch (error: unknown) {
    if (isRecordNotFoundError(error)) {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That relationship no longer exists.",
      };
    }
    console.error("Failed to update client relationship", error);
    return {
      status: "error",
      values,
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(RELATIONSHIPS_PATH);
  revalidatePath(relationshipPath(relationshipId));
  redirect(relationshipPath(relationshipId));
}

export async function updateLifecycleAction(
  relationshipId: string,
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const admin = await getAdminUser();

  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  const rawLifecycle = formData.get("lifecycle");
  const lifecycle = typeof rawLifecycle === "string" ? rawLifecycle.trim() : "";

  if (!isLifecycleValue(lifecycle)) {
    return { status: "error", error: "Pick a lifecycle state from the list." };
  }

  try {
    await prisma.clientRelationship.update({
      where: { id: relationshipId },
      data: { lifecycle },
      select: { id: true },
    });
  } catch (error: unknown) {
    if (isRecordNotFoundError(error)) {
      return { status: "error", error: "That relationship no longer exists." };
    }
    console.error("Failed to update relationship lifecycle", error);
    return { status: "error", error: "Something went wrong while saving. Try again." };
  }

  revalidatePath(RELATIONSHIPS_PATH);
  revalidatePath(relationshipPath(relationshipId));
  return { status: "idle" };
}

export async function attachClientUserAction(
  relationshipId: string,
  _prevState: AttachClientUserFormState,
  formData: FormData,
): Promise<AttachClientUserFormState> {
  const admin = await getAdminUser();
  const rawEmail = formData.get("email");
  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!admin) {
    return { status: "error", email, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (!email) {
    return {
      status: "error",
      email,
      errors: { email: "Email is required." },
    };
  }

  if (email.length > MAX_EMAIL_LENGTH || !isValidEmail(email)) {
    return {
      status: "error",
      email,
      errors: { email: "Enter a valid email address." },
    };
  }

  let relationshipIdValue: string | null = null;

  try {
    const relationship = await prisma.clientRelationship.findUnique({
      where: { id: relationshipId },
      select: { id: true },
    });

    relationshipIdValue = relationship?.id ?? null;
  } catch (error: unknown) {
    console.error("Failed to load relationship", error);
    return {
      status: "error",
      email,
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  if (!relationshipIdValue) {
    return {
      status: "error",
      email,
      errors: {},
      formError: "That relationship no longer exists.",
    };
  }

  let clerkUserId: string;
  let clerkUserName: string | null;

  try {
    const client = await clerkClient();
    const { data: candidates } = await client.users.getUserList({
      emailAddress: [email],
    });
    const match = candidates.find((candidate) =>
      candidate.emailAddresses.some(
        (address) =>
          address.emailAddress.toLowerCase() === email &&
          address.verification?.status === "verified",
      ),
    );

    if (!match) {
      return {
        status: "error",
        email,
        errors: {
          email:
            "No account with a verified matching email was found. The person must sign up and verify that email before they can be attached.",
        },
      };
    }

    clerkUserId = match.id;
    clerkUserName =
      [match.firstName, match.lastName].filter(Boolean).join(" ") || null;
  } catch (error: unknown) {
    console.error("Failed to look up Clerk user by email", error);
    return {
      status: "error",
      email,
      errors: {},
      formError: "Could not reach the account service. Try again in a moment.",
    };
  }

  let existing: { id: string; status: string } | null = null;

  try {
    existing = await prisma.clientUser.findUnique({
      where: {
        clientRelationshipId_clerkUserId: {
          clientRelationshipId: relationshipId,
          clerkUserId,
        },
      },
      select: { id: true, status: true },
    });
  } catch (error: unknown) {
    console.error("Failed to check client user membership", error);
    return {
      status: "error",
      email,
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  if (existing?.status === "ACTIVE") {
    return {
      status: "error",
      email,
      errors: { email: ALREADY_ATTACHED },
    };
  }

  try {
    if (existing) {
      await prisma.clientUser.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", email, name: clerkUserName },
        select: { id: true },
      });
    } else {
      await prisma.clientUser.create({
        data: {
          clientRelationshipId: relationshipId,
          clerkUserId,
          email,
          name: clerkUserName,
          status: "ACTIVE",
        },
        select: { id: true },
      });
    }
  } catch (error: unknown) {
    // A concurrent attach can win the race between the findUnique check
    // and this create, so the compound unique violation means the person
    // is already attached rather than a generic failure.
    if (isUniqueConstraintError(error, "clerkUserId")) {
      return {
        status: "error",
        email,
        errors: { email: ALREADY_ATTACHED },
      };
    }
    console.error("Failed to attach client user", error);
    return {
      status: "error",
      email,
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(relationshipPath(relationshipId));
  return { status: "idle", email: "", errors: {} };
}

export async function removeClientUserAction(
  relationshipId: string,
  clientUserId: string,
  _prevState: SimpleActionState,
): Promise<SimpleActionState> {
  const admin = await getAdminUser();

  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  let count = 0;

  try {
    const result = await prisma.clientUser.updateMany({
      where: {
        id: clientUserId,
        clientRelationshipId: relationshipId,
        status: "ACTIVE",
      },
      data: { status: "REMOVED" },
    });

    count = result.count;
  } catch (error: unknown) {
    console.error("Failed to remove client user", error);
    return {
      status: "error",
      error: "Something went wrong while saving. Try again.",
    };
  }

  if (count === 0) {
    return {
      status: "error",
      error: "That membership was already removed or does not exist.",
    };
  }

  revalidatePath(relationshipPath(relationshipId));
  return { status: "idle" };
}

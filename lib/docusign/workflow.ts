import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db/client";
import type { SendEnvelopeOptions } from "@/lib/docusign/client";

/** Marks a contract whose envelope is being created. Never a real DocuSign ID. */
const PENDING_ENVELOPE_PREFIX = "pending:";

export interface SendContractDependencies {
  /** Creates the DocuSign envelope. Called at most once per successful claim. */
  createEnvelope: (
    options: SendEnvelopeOptions,
  ) => Promise<{ envelopeId: string; status: string }>;
  /** Reads the generated contract PDF from private storage. */
  getPdf: (key: string) => Promise<Buffer>;
  admin: { email: string; name: string };
  webhookUrl: string;
}

export type SendContractResult =
  | { status: "sent"; envelopeId: string }
  | { status: "contract-missing" }
  | { status: "already-sent" }
  | { status: "pdf-missing" };

export function isPendingEnvelopeId(envelopeId: string | null): boolean {
  return envelopeId?.startsWith(PENDING_ENVELOPE_PREFIX) ?? false;
}

/**
 * Sends one contract to DocuSign at most once.
 *
 * The contract is claimed first by writing a pending marker into
 * `docusignEnvelopeId` with a conditional update, so two concurrent sends
 * cannot both reach the provider. If anything fails before DocuSign returns an
 * envelope, the claim is released and a later send can retry. If DocuSign did
 * create an envelope, its ID is kept so a retry cannot create a second one.
 */
export async function sendContractToDocuSign(
  clientRelationshipId: string,
  contractId: string,
  dependencies: SendContractDependencies,
): Promise<SendContractResult> {
  const contract = await prisma.contract.findFirst({
    where: { id: contractId, clientRelationshipId },
    select: {
      id: true,
      signerEmail: true,
      docusignEnvelopeId: true,
      s3Key: true,
      s3Bucket: true,
      templateVersion: {
        select: { contractTemplate: { select: { name: true } } },
      },
    },
  });

  if (!contract) return { status: "contract-missing" };
  if (contract.docusignEnvelopeId) return { status: "already-sent" };
  if (!contract.s3Key || !contract.s3Bucket) return { status: "pdf-missing" };

  const claimId = `${PENDING_ENVELOPE_PREFIX}${randomUUID()}`;
  const claimed = await prisma.contract.updateMany({
    where: { id: contract.id, clientRelationshipId, docusignEnvelopeId: null },
    data: { docusignEnvelopeId: claimId },
  });
  if (claimed.count === 0) return { status: "already-sent" };

  let providerEnvelopeId: string | undefined;
  try {
    const pdfBuffer = await dependencies.getPdf(contract.s3Key);
    const documentName =
      contract.templateVersion?.contractTemplate?.name ?? "Contract";

    const envelope = await dependencies.createEnvelope({
      pdfBuffer,
      documentName,
      signerEmail: contract.signerEmail ?? "",
      signerName: contract.signerEmail ?? "",
      adminEmail: dependencies.admin.email,
      adminName: dependencies.admin.name,
      webhookUrl: dependencies.webhookUrl,
    });
    if (!envelope.envelopeId) {
      throw new Error("DocuSign did not return an envelope ID.");
    }
    providerEnvelopeId = envelope.envelopeId;

    const finalized = await prisma.contract.updateMany({
      where: { id: contract.id, docusignEnvelopeId: claimId },
      data: {
        docusignEnvelopeId: envelope.envelopeId,
        docusignStatus: envelope.status,
        status: "SENT_FOR_SIGNING",
      },
    });
    if (finalized.count === 0) {
      throw new Error("The DocuSign send claim was lost before it was saved.");
    }

    return { status: "sent", envelopeId: envelope.envelopeId };
  } catch (error: unknown) {
    await prisma.contract
      .updateMany({
        where: { id: contract.id, docusignEnvelopeId: claimId },
        data: providerEnvelopeId
          ? {
              docusignEnvelopeId: providerEnvelopeId,
              status: "SENT_FOR_SIGNING",
            }
          : { docusignEnvelopeId: null },
      })
      .catch((releaseError: unknown) => {
        console.error("Failed to release the DocuSign send claim", releaseError);
      });
    throw error;
  }
}

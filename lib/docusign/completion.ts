import { prisma } from "@/lib/db/client";
import { downloadSignedPdf } from "@/lib/docusign/client";
import { uploadToPrivateS3 } from "@/lib/storage/s3";

/**
 * How long one webhook delivery may hold the archive claim. A claim older than
 * this is treated as abandoned (the process died mid-archive) and can be taken
 * over by a later delivery.
 */
export const ARCHIVE_CLAIM_TTL_MS = 5 * 60 * 1000;

export interface CompletionDependencies {
  downloadSignedPdf: (envelopeId: string) => Promise<Buffer>;
  uploadToPrivateS3: (
    key: string,
    body: Buffer,
    contentType: string,
  ) => Promise<{ bucket: string; key: string }>;
}

const defaultDependencies: CompletionDependencies = {
  downloadSignedPdf,
  uploadToPrivateS3,
};

export interface CompletedEnvelope {
  contractId: string;
  clientRelationshipId: string;
  envelopeId: string;
  /** The raw DocuSign status string, stored on the contract. */
  docusignStatus: string;
}

export type CompletionResult =
  /** The signed PDF is stored and the contract is COMPLETE. */
  | { status: "completed"; s3Key: string }
  /** An earlier delivery already completed the contract. */
  | { status: "already-complete" }
  /** Another delivery holds the claim right now. */
  | { status: "in-progress" }
  /** AWS_REGION or S3_PRIVATE_BUCKET is unset, so nothing can be archived. */
  | { status: "storage-not-configured" }
  /** The download or upload failed. The claim is released for a retry. */
  | { status: "archive-failed" };

/**
 * Archives the signed PDF and only then marks the contract COMPLETE
 * (Unit 08: "Mark contract complete only after ... Store signed PDF in
 * private S3"). Any non-`completed` result leaves the contract as it was, so
 * the webhook can answer non-2xx and DocuSign Connect retries the delivery.
 */
export async function completeSignedContract(
  envelope: CompletedEnvelope,
  dependencies: CompletionDependencies = defaultDependencies,
  now: Date = new Date(),
): Promise<CompletionResult> {
  if (!process.env.AWS_REGION?.trim() || !process.env.S3_PRIVATE_BUCKET?.trim()) {
    return { status: "storage-not-configured" };
  }

  const claimed = await prisma.contract.updateMany({
    where: {
      id: envelope.contractId,
      docusignEnvelopeId: envelope.envelopeId,
      status: { notIn: ["COMPLETE", "VOIDED"] },
      OR: [
        { signedPdfArchiveClaimedAt: null },
        {
          signedPdfArchiveClaimedAt: {
            lt: new Date(now.getTime() - ARCHIVE_CLAIM_TTL_MS),
          },
        },
      ],
    },
    data: { signedPdfArchiveClaimedAt: now },
  });

  if (claimed.count === 0) {
    const current = await prisma.contract.findUnique({
      where: { id: envelope.contractId },
      select: { status: true },
    });
    return current?.status === "COMPLETE"
      ? { status: "already-complete" }
      : { status: "in-progress" };
  }

  try {
    const signedPdf = await dependencies.downloadSignedPdf(envelope.envelopeId);
    const signedKey = `contracts/${envelope.clientRelationshipId}/signed-${envelope.envelopeId}.pdf`;
    const stored = await dependencies.uploadToPrivateS3(
      signedKey,
      signedPdf,
      "application/pdf",
    );

    const completed = await prisma.contract.updateMany({
      where: { id: envelope.contractId, signedPdfArchiveClaimedAt: now },
      data: {
        status: "COMPLETE",
        docusignStatus: envelope.docusignStatus,
        s3Key: stored.key,
        s3Bucket: stored.bucket,
        signedPdfArchiveClaimedAt: null,
      },
    });
    if (completed.count === 0) {
      // A later delivery took over an expired claim and owns completion now.
      return { status: "in-progress" };
    }

    return { status: "completed", s3Key: stored.key };
  } catch (error: unknown) {
    console.error("Failed to archive signed PDF", error);
    await prisma.contract
      .updateMany({
        where: { id: envelope.contractId, signedPdfArchiveClaimedAt: now },
        data: { signedPdfArchiveClaimedAt: null },
      })
      .catch((releaseError: unknown) => {
        console.error("Failed to release the signed PDF archive claim", releaseError);
      });
    return { status: "archive-failed" };
  }
}

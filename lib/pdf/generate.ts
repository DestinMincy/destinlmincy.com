import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

import type { TemplateSnapshot } from "@/lib/contracts/types";
import { ContractPdf } from "./contract-pdf";

export interface GenerateContractPdfOptions {
  templateName: string;
  snapshot: TemplateSnapshot;
  fieldValues: Record<string, string>;
  signerEmail: string;
}

/**
 * Renders a ContractPdf document to a Buffer using @react-pdf/renderer.
 * Must be called from a Node.js server context (Server Action or Route Handler).
 */
export async function generateContractPdf(
  options: GenerateContractPdfOptions,
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ContractPdf as any, {
    ...options,
    generatedAt,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}

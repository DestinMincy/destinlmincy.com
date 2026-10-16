import { createRequire } from "node:module";

import type docusign from "docusign-esign";

type DocuSignSdk = typeof docusign;

let sdk: DocuSignSdk | undefined;

/**
 * docusign-esign ships UMD wrappers with AMD `define()` calls that the
 * bundler cannot parse, in the bundle and in externals tracing alike. The
 * package is loaded here with a Node `require` created at runtime, invoked
 * through `Reflect.apply` so the bundler does not rewrite the call, which
 * keeps the package out of the build graph and lets Node resolve it from
 * node_modules on the server. A plain `require("docusign-esign")` or a
 * static import breaks `next build`.
 */
function loadDocuSign(): DocuSignSdk {
  if (!sdk) {
    const nodeRequire = createRequire(import.meta.url);
    sdk = Reflect.apply(nodeRequire, undefined, ["docusign-esign"]) as DocuSignSdk;
  }
  return sdk;
}

function getDocuSignConfig() {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const privateKeyRaw = process.env.DOCUSIGN_PRIVATE_KEY;
  const oauthBasePath =
    process.env.DOCUSIGN_OAUTH_BASE_PATH ?? "account-d.docusign.com";
  const impersonatedUserId = process.env.DOCUSIGN_IMPERSONATED_USER_ID;

  if (!integrationKey || !accountId || !privateKeyRaw || !impersonatedUserId) {
    throw new Error(
      "DocuSign env vars not configured: DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_ACCOUNT_ID, DOCUSIGN_PRIVATE_KEY, DOCUSIGN_IMPERSONATED_USER_ID",
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  return { integrationKey, accountId, privateKey, oauthBasePath, impersonatedUserId };
}

export async function getDocuSignApiClient(): Promise<{
  client: docusign.ApiClient;
  accountId: string;
}> {
  const config = getDocuSignConfig();

  const apiClient = new (loadDocuSign().ApiClient)();
  apiClient.setOAuthBasePath(config.oauthBasePath);

  let response: Awaited<ReturnType<typeof apiClient.requestJWTUserToken>>;
  try {
    response = await apiClient.requestJWTUserToken(
      config.integrationKey,
      config.impersonatedUserId,
      ["signature", "impersonation"],
      Buffer.from(config.privateKey),
      3600,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const body = (err as { response?: { body?: string | { error?: string } } })
      ?.response?.body;
    const bodyStr =
      typeof body === "string" ? body : body ? JSON.stringify(body) : "";
    if (msg.includes("consent_required") || bodyStr.includes("consent_required")) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "https://destinlmincy.com";
      const consentUrl =
        `https://${config.oauthBasePath}/oauth/auth?response_type=code` +
        `&scope=signature%20impersonation` +
        `&client_id=${config.integrationKey}` +
        `&redirect_uri=${encodeURIComponent(`${appUrl}/api/auth/callback`)}`;
      throw new Error(
        `DocuSign JWT consent required. Visit: ${consentUrl}`,
      );
    }
    throw err;
  }

  const accessToken = response.body.access_token;
  apiClient.addDefaultHeader("Authorization", `Bearer ${accessToken}`);
  apiClient.setBasePath(
    config.oauthBasePath.includes("account-d")
      ? "https://demo.docusign.net/restapi"
      : "https://www.docusign.net/restapi",
  );

  return { client: apiClient, accountId: config.accountId };
}

export interface SendEnvelopeOptions {
  pdfBuffer: Buffer;
  documentName: string;
  signerEmail: string;
  signerName: string;
  adminEmail: string;
  adminName: string;
  webhookUrl: string;
}

/**
 * Builds the envelope: one client signer plus admin countersignature, with a
 * Connect notification back to `webhookUrl`. Connect signs each notification
 * (`includeHMAC`), because the webhook rejects unsigned requests.
 */
export function buildEnvelopeDefinition(
  options: SendEnvelopeOptions,
): docusign.EnvelopeDefinition {
  const docBase64 = options.pdfBuffer.toString("base64");

  const document: docusign.Document = {
    documentBase64: docBase64,
    name: options.documentName,
    fileExtension: "pdf",
    documentId: "1",
  };

  const clientSigner: docusign.Signer = {
    email: options.signerEmail,
    name: options.signerName,
    recipientId: "1",
    routingOrder: "1",
    tabs: {
      signHereTabs: [
        {
          anchorString: "Client signature",
          anchorXOffset: "0",
          // Offset upward past the label to land on the signature line above it.
          anchorYOffset: "-40",
          anchorUnits: "pixels",
        } as docusign.SignHere,
      ],
    },
  };

  const adminSigner: docusign.Signer = {
    email: options.adminEmail,
    name: options.adminName,
    recipientId: "2",
    routingOrder: "2",
    tabs: {
      signHereTabs: [
        {
          anchorString: "Admin signature",
          anchorXOffset: "0",
          // Offset upward past the label to land on the signature line above it.
          anchorYOffset: "-40",
          anchorUnits: "pixels",
        } as docusign.SignHere,
      ],
    },
  };

  return {
    // DocuSign rejects an envelope whose subject is longer than 100 characters.
    emailSubject: `Please sign: ${options.documentName}`.slice(0, 100),
    documents: [document],
    recipients: {
      signers: [clientSigner, adminSigner],
    },
    status: "sent",
    eventNotification: {
      url: options.webhookUrl,
      loggingEnabled: "true",
      requireAcknowledgment: "true",
      includeHMAC: "true",
      envelopeEvents: [
        { envelopeEventStatusCode: "sent" },
        { envelopeEventStatusCode: "delivered" },
        { envelopeEventStatusCode: "completed" },
        { envelopeEventStatusCode: "declined" },
        { envelopeEventStatusCode: "voided" },
      ] as docusign.EnvelopeEvent[],
      recipientEvents: [
        { recipientEventStatusCode: "Sent" },
        { recipientEventStatusCode: "Delivered" },
        { recipientEventStatusCode: "Completed" },
        { recipientEventStatusCode: "Declined" },
      ] as docusign.RecipientEvent[],
    },
  };
}

/**
 * Creates a DocuSign envelope from `buildEnvelopeDefinition`.
 * Returns the envelope ID and current status.
 */
export async function sendEnvelopeForSigning(
  options: SendEnvelopeOptions,
): Promise<{ envelopeId: string; status: string }> {
  const { client, accountId } = await getDocuSignApiClient();
  const envelopesApi = new (loadDocuSign().EnvelopesApi)(client);

  const result = await envelopesApi.createEnvelope(accountId, {
    envelopeDefinition: buildEnvelopeDefinition(options),
  });

  return {
    envelopeId: result.envelopeId ?? "",
    status: result.status ?? "sent",
  };
}

/**
 * Downloads the final signed PDF from DocuSign as a Buffer.
 */
export async function downloadSignedPdf(
  envelopeId: string,
): Promise<Buffer> {
  const { client, accountId } = await getDocuSignApiClient();
  const envelopesApi = new (loadDocuSign().EnvelopesApi)(client);

  const stream = await envelopesApi.getDocument(accountId, envelopeId, "combined", {});
  if (Buffer.isBuffer(stream)) return Buffer.from(stream);
  return Buffer.from(stream as unknown as ArrayBuffer);
}

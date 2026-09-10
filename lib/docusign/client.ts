import docusign from "docusign-esign";

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

  const apiClient = new docusign.ApiClient();
  apiClient.setOAuthBasePath(config.oauthBasePath);

  const response = await apiClient.requestJWTUserToken(
    config.integrationKey,
    config.impersonatedUserId,
    ["signature", "impersonation"],
    Buffer.from(config.privateKey),
    3600,
  );

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
 * Creates a DocuSign envelope with one client signer plus admin countersignature.
 * Returns the envelope ID and current status.
 */
export async function sendEnvelopeForSigning(
  options: SendEnvelopeOptions,
): Promise<{ envelopeId: string; status: string }> {
  const { client, accountId } = await getDocuSignApiClient();
  const envelopesApi = new docusign.EnvelopesApi(client);

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

  const envelopeDefinition: docusign.EnvelopeDefinition = {
    emailSubject: `Please sign: ${options.documentName}`,
    documents: [document],
    recipients: {
      signers: [clientSigner, adminSigner],
    },
    status: "sent",
    eventNotification: {
      url: options.webhookUrl,
      loggingEnabled: "true",
      requireAcknowledgment: "true",
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

  const result = await envelopesApi.createEnvelope(accountId, {
    envelopeDefinition,
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
  const envelopesApi = new docusign.EnvelopesApi(client);

  const stream = await envelopesApi.getDocument(accountId, envelopeId, "combined", {});
  if (Buffer.isBuffer(stream)) return Buffer.from(stream);
  return Buffer.from(stream as unknown as ArrayBuffer);
}

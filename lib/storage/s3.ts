import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client() {
  const region = process.env.AWS_REGION;
  if (!region) throw new Error("AWS_REGION is not set");
  return new S3Client({ region });
}

function getPrivateBucket(): string {
  const bucket = process.env.S3_PRIVATE_BUCKET;
  if (!bucket) throw new Error("S3_PRIVATE_BUCKET is not set");
  return bucket;
}

export interface S3UploadResult {
  bucket: string;
  key: string;
}

/**
 * Uploads a Buffer to the private S3 bucket and returns the bucket and key.
 */
export async function uploadToPrivateS3(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<S3UploadResult> {
  const client = getS3Client();
  const bucket = getPrivateBucket();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
    }),
  );

  return { bucket, key };
}

/**
 * Returns a short-lived presigned URL for downloading a private S3 object.
 * Default expiry is 15 minutes.
 */
export async function getPrivateDownloadUrl(
  key: string,
  expiresInSeconds = 900,
): Promise<string> {
  const client = getS3Client();
  const bucket = getPrivateBucket();

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "course-manager-files";
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

// Stub mode when R2 credentials are not configured
export const isStubMode = !R2_ACCESS_KEY_ID;

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return _s3Client;
}

export function generateFileKey(
  scope: "courses" | "schedules",
  scopeId: string,
  filename: string,
): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  return `${scope}/${scopeId}/${timestamp}-${sanitized}`;
}

export async function createPresignedPutUrl(fileKey: string, contentType: string): Promise<string> {
  if (isStubMode) {
    return `stub://upload/${fileKey}`;
  }
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 600 });
}

export async function createPresignedGetUrl(fileKey: string): Promise<string> {
  if (isStubMode) {
    return `stub://download/${fileKey}`;
  }
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${fileKey}`;
  }
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
}

export async function deleteObject(fileKey: string): Promise<void> {
  if (isStubMode) return;
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });
  await getS3Client().send(command);
}

import type { Schema } from "../data/resource";
import { env } from "$amplify/env/listEpubs";
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";

export const listEpubsFromS3 = async (): Promise<string[]> => {
  const key = `epubs/`;
  const client = new S3Client({ region: env.AWS_REGION });
  const command = new ListObjectsCommand({
    Bucket: env.JPC_SPEED_READ_STORAGE_BUCKET_NAME,
    Prefix: key,
  });
  const response = await client.send(command);
  return response.Contents?.map((obj) => obj.Key!).filter((t) => t) ?? [];
};

export const handler: Schema["listEpubs"]["functionHandler"] = async () => {
  const epubKeys = await listEpubsFromS3();
  return { epubKeys };
};

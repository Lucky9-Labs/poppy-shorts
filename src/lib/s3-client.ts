import {GetObjectCommand, ListObjectsV2Command, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import type {CatalogItem} from "./content-catalog";
import type {S3ListClient} from "./list-s3-content";

/**
 * Node-only S3 helpers. Do not import this file from Remotion compositions —
 * it pulls in the AWS SDK and expects the default credential chain.
 */
export function createS3ListClient(region?: string): S3ListClient {
  const client = new S3Client({
    region: region ?? process.env.AWS_REGION ?? "us-east-1",
  });

  return {
    async listObjectsV2(input) {
      const out = await client.send(new ListObjectsV2Command(input));
      return {
        Contents: out.Contents?.map((object) => ({
          Key: object.Key,
          Size: object.Size,
        })),
        IsTruncated: out.IsTruncated,
        NextContinuationToken: out.NextContinuationToken,
      };
    },
  };
}

/** Attaches time-limited HTTPS URLs so Remotion can play private objects. */
export async function attachPresignedUrls(
  items: CatalogItem[],
  expiresInSeconds = 3600,
  region?: string,
): Promise<CatalogItem[]> {
  const client = new S3Client({
    region: region ?? process.env.AWS_REGION ?? "us-east-1",
  });

  return Promise.all(
    items.map(async (item) => ({
      ...item,
      url: await getSignedUrl(
        client,
        new GetObjectCommand({Bucket: item.bucket, Key: item.key}),
        {expiresIn: expiresInSeconds},
      ),
    })),
  );
}

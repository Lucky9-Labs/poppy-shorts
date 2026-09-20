import {emptyContentCatalog, mergeContentCatalogs} from "./content-catalog";
import type {CatalogItem, ContentCatalog} from "./content-catalog";
import {parseContentSourcesInput} from "./content-sources";
import {classifyContentKind, parseS3Uri, toS3Uri} from "./s3-uri";

/** Minimal ListObjects surface so tests can fake S3 without AWS credentials. */
export type S3ListClient = {
  listObjectsV2: (input: {
    Bucket: string;
    Prefix?: string;
    ContinuationToken?: string;
  }) => Promise<{
    Contents?: Array<{Key?: string; Size?: number}>;
    IsTruncated?: boolean;
    NextContinuationToken?: string;
  }>;
};

/**
 * Lists image / video / audio objects under one `s3://bucket/prefix` folder.
 */
export async function listPrefix(
  client: S3ListClient,
  source: string,
): Promise<CatalogItem[]> {
  const {bucket, prefix} = parseS3Uri(source);
  const items: CatalogItem[] = [];
  let token: string | undefined;

  do {
    const page = await client.listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: token,
    });
    items.push(...collectMediaItems(page.Contents, bucket, source));
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);

  return items;
}

/**
 * Lists every configured folder and merges the results into one catalog.
 * An empty `contentSources` list returns an empty catalog (offline mode).
 */
export async function listContentSources(
  client: S3ListClient,
  contentSources: string[],
): Promise<ContentCatalog> {
  const sources = parseContentSourcesInput(contentSources);
  let catalog = emptyContentCatalog();

  for (const source of sources) {
    const items = await listPrefix(client, source);
    catalog = mergeContentCatalogs(catalog, {sources: [source], items});
  }

  return catalog;
}

function collectMediaItems(
  contents: Array<{Key?: string; Size?: number}> | undefined,
  bucket: string,
  sourcePrefix: string,
): CatalogItem[] {
  const items: CatalogItem[] = [];
  for (const object of contents ?? []) {
    if (!object.Key || object.Key.endsWith("/")) {
      continue;
    }
    const kind = classifyContentKind(object.Key);
    if (kind === "other") {
      continue;
    }
    items.push({
      uri: toS3Uri(bucket, object.Key),
      bucket,
      key: object.Key,
      kind,
      sourcePrefix,
      sizeBytes: object.Size,
    });
  }
  return items;
}

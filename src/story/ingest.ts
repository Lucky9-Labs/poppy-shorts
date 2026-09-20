import {emptyContentCatalog} from "../lib/content-catalog";
import type {ContentCatalog} from "../lib/content-catalog";
import {listContentSources} from "../lib/list-s3-content";
import type {S3ListClient} from "../lib/list-s3-content";
import {parseContentSourcesInput} from "../lib/content-sources";

/**
 * Ingest stage: list media under each `contentSources` prefix.
 * When no lister or no prefixes are provided, returns an empty catalog
 * so the rest of the pipeline can stay offline.
 */
export async function ingestContentSources(input: {
  contentSources: string[];
  catalog?: ContentCatalog;
  lister?: S3ListClient;
}): Promise<{catalog: ContentCatalog; skipped: boolean}> {
  if (input.catalog) {
    return {catalog: input.catalog, skipped: false};
  }

  const sources = parseContentSourcesInput(input.contentSources);
  if (!input.lister || sources.length === 0) {
    return {catalog: emptyContentCatalog(), skipped: true};
  }

  return {
    catalog: await listContentSources(input.lister, sources),
    skipped: false,
  };
}

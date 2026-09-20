import type {ContentCatalog} from "../lib/content-catalog";
import {emptyInventory, stubFromCatalogItem} from "./schema";
import type {ClipInventory, ClipRecord} from "./schema";

/**
 * Upserts stubs from an S3 listing. Existing tags, scores, notes, and
 * `usedInShorts` are kept. Clips missing from this listing are not deleted.
 */
export function mergeCatalogIntoInventory(
  existing: ClipInventory | undefined,
  catalog: ContentCatalog,
): ClipInventory {
  const prior = existing ?? emptyInventory();
  const byUri = new Map(prior.clips.map((clip) => [clip.s3Uri, clip]));

  for (const item of catalog.items) {
    const current = byUri.get(item.uri);
    byUri.set(item.uri, current ? refreshStub(current, item) : stubFromCatalogItem(item));
  }

  return {
    version: 1,
    clips: [...byUri.values()],
  };
}

function refreshStub(
  current: ClipRecord,
  item: ContentCatalog["items"][number],
): ClipRecord {
  return {
    ...current,
    sourcePrefix: item.sourcePrefix,
    mediaType: item.kind,
    key: item.key,
  };
}

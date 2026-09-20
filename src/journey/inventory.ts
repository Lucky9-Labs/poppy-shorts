import type {CatalogItem, ContentCatalog} from "../lib/content-catalog";
import {classifyContentKind} from "../lib/s3-uri";
import {mergeCatalogIntoInventory} from "../inventory/merge";
import type {ClipInventory, ClipRecord} from "../inventory/schema";
import type {JourneyPackage} from "./schema";
import {artifactSourcePrefix, publishedArtifactUri} from "./uri";

/** Turns journey artifacts into catalog rows the inventory merger already understands. */
export function journeyToCatalogItems(pkg: JourneyPackage): CatalogItem[] {
  const items: CatalogItem[] = [];
  for (const artifact of pkg.artifacts) {
    const uri = publishedArtifactUri(artifact.path, pkg.publishedPrefix);
    const kind = artifact.mediaType ?? classifyContentKind(artifact.path);
    if (kind === "other") {
      continue;
    }
    items.push({
      uri,
      bucket: uri.startsWith("s3://") ? uri.slice(5).split("/")[0]! : "local",
      key: uri.replace(/^(s3:\/\/[^/]+\/|file:)/, ""),
      kind,
      sourcePrefix: pkg.publishedPrefix ?? artifactSourcePrefix(uri),
    });
  }
  return items;
}

/** Upserts journey stubs. Existing scores and notes are kept. */
export function mergeJourneyIntoInventory(
  existing: ClipInventory,
  pkg: JourneyPackage,
): ClipInventory {
  const items = journeyToCatalogItems(pkg);
  const catalog: ContentCatalog = {
    sources: pkg.publishedPrefix ? [pkg.publishedPrefix] : [],
    items,
  };
  return annotateJourneyNotes(mergeCatalogIntoInventory(existing, catalog), pkg, items);
}

function annotateJourneyNotes(
  inventory: ClipInventory,
  pkg: JourneyPackage,
  items: CatalogItem[],
): ClipInventory {
  const uris = new Set(items.map((item) => item.uri));
  const note = journeyNote(pkg);
  return {
    ...inventory,
    clips: inventory.clips.map((clip) => attachNote(clip, uris, note)),
  };
}

function attachNote(clip: ClipRecord, uris: Set<string>, note: string): ClipRecord {
  if (!uris.has(clip.s3Uri) || clip.notes) {
    return clip;
  }
  return {...clip, notes: note};
}

function journeyNote(pkg: JourneyPackage): string {
  const runtime = [pkg.runtime?.identity, pkg.runtime?.commit, pkg.runtime?.branch]
    .filter(Boolean)
    .join(" ");
  return runtime ? `${pkg.caption} (${runtime})` : pkg.caption;
}

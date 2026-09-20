import type {ContentKind} from "./s3-uri";

/** One media object discovered under an S3 folder prefix. */
export type CatalogItem = {
  uri: string;
  bucket: string;
  key: string;
  kind: Exclude<ContentKind, "other">;
  sourcePrefix: string;
  sizeBytes?: number;
  /** HTTPS playback URL (public object or prep-script presign). */
  url?: string;
};

/** Merged view of every configured S3 folder for one render. */
export type ContentCatalog = {
  sources: string[];
  items: CatalogItem[];
};

/** Empty catalog used when S3 is not configured. */
export function emptyContentCatalog(): ContentCatalog {
  return {sources: [], items: []};
}

/**
 * Concatenates catalogs from several prefixes. Duplicate object URIs keep
 * the first occurrence; every source folder is still recorded.
 */
export function mergeContentCatalogs(
  ...catalogs: ContentCatalog[]
): ContentCatalog {
  const sources: string[] = [];
  const sourceSeen = new Set<string>();
  const items: CatalogItem[] = [];
  const uriSeen = new Set<string>();

  for (const catalog of catalogs) {
    for (const source of catalog.sources) {
      if (!sourceSeen.has(source)) {
        sourceSeen.add(source);
        sources.push(source);
      }
    }
    for (const item of catalog.items) {
      if (uriSeen.has(item.uri)) {
        continue;
      }
      uriSeen.add(item.uri);
      items.push(item);
    }
  }

  return {sources, items};
}

/** Items of one media kind, in list order. */
export function catalogItemsOfKind(
  catalog: ContentCatalog,
  kind: CatalogItem["kind"],
): CatalogItem[] {
  return catalog.items.filter((item) => item.kind === kind);
}

/** Picks the Nth item of a kind, or null when the slot is empty. */
export function pickCatalogItem(
  catalog: ContentCatalog,
  kind: CatalogItem["kind"],
  index: number,
): CatalogItem | null {
  return catalogItemsOfKind(catalog, kind)[index] ?? null;
}

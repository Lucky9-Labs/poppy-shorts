import {pickCatalogItem} from "./content-catalog";
import type {ContentCatalog} from "./content-catalog";
import type {BeatSource, CatalogBeatSource} from "./schema";

type RenderableSource = Exclude<BeatSource, CatalogBeatSource>;

/**
 * Turns a `catalog` beat into a playable image/video source.
 * Missing items or objects without an HTTPS URL fall back to a placeholder
 * so ExampleShort still renders when S3 is not configured.
 */
export function resolveCatalogSource(
  source: CatalogBeatSource,
  catalog: ContentCatalog | undefined,
): RenderableSource {
  const fallback: RenderableSource = {
    type: "placeholder",
    color: source.fallbackColor ?? "#0b0f14",
    label: source.fallbackLabel ?? "S3",
  };
  const item = catalog
    ? pickCatalogItem(catalog, source.kind, source.index)
    : null;
  if (!item?.url) {
    return fallback;
  }
  if (item.kind === "video") {
    return {type: "video", src: item.url};
  }
  if (item.kind === "image") {
    return {type: "image", src: item.url};
  }
  return fallback;
}

/** Resolves catalog beats; other beat sources pass through unchanged. */
export function resolveBeatSource(
  source: BeatSource,
  catalog: ContentCatalog | undefined,
): RenderableSource {
  if (source.type !== "catalog") {
    return source;
  }
  return resolveCatalogSource(source, catalog);
}

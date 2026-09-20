import type {CatalogItem} from "../lib/content-catalog";
import type {ClipInventory} from "./schema";
import {clipScore, findClipByUri} from "./score";

/**
 * Prefer clips humans marked as visually rich / engaging.
 * Without an inventory, listing order is unchanged (offline / untagged).
 */
export function rankCatalogItems(
  items: readonly CatalogItem[],
  inventory: ClipInventory | undefined,
  kind: CatalogItem["kind"],
): CatalogItem[] {
  const ofKind = items.filter((item) => item.kind === kind);
  if (!inventory) {
    return ofKind;
  }

  return [...ofKind].sort((left, right) => {
    const delta =
      clipScore(findClipByUri(inventory, right.uri)) -
      clipScore(findClipByUri(inventory, left.uri));
    if (delta !== 0) {
      return delta;
    }
    return left.uri.localeCompare(right.uri);
  });
}

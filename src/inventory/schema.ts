import {z} from "zod";
import type {CatalogItem} from "../lib/content-catalog";
import {clipIdFromUri} from "./clip-id";

/** Bump when the on-disk `inventory/clips.json` shape changes. */
export const INVENTORY_VERSION = 1 as const;

/** Suggested nature buckets — also accepted as freeform `tags`. */
export const NATURE_TAGS = [
  "gameplay",
  "wip",
  "bug",
  "mech-flex",
  "horror",
  "absurd",
  "hangar",
  "ui",
  "concept-art",
  "b-roll",
] as const;

export const NatureTagSchema = z.enum(NATURE_TAGS);
export type NatureTag = z.infer<typeof NatureTagSchema>;

const ScoreSchema = z.number().int().min(1).max(5);

export const ClipRecordSchema = z.object({
  id: z.string().min(1),
  s3Uri: z.string().min(1),
  sourcePrefix: z.string().min(1),
  mediaType: z.enum(["video", "image", "audio"]),
  key: z.string().optional(),
  nature: z.array(NatureTagSchema).default([]),
  tags: z.array(z.string().min(1)).default([]),
  visualRichness: ScoreSchema.optional(),
  engagement: ScoreSchema.optional(),
  hookPotential: ScoreSchema.optional(),
  notes: z.string().optional(),
  taggedBy: z.string().optional(),
  taggedAt: z.string().optional(),
  usedInShorts: z.array(z.string()).default([]),
});

export const ClipInventorySchema = z.object({
  version: z.literal(INVENTORY_VERSION),
  clips: z.array(ClipRecordSchema),
});

export type ClipRecord = z.infer<typeof ClipRecordSchema>;
export type ClipInventory = z.infer<typeof ClipInventorySchema>;

export function emptyInventory(): ClipInventory {
  return {version: INVENTORY_VERSION, clips: []};
}

/** Untagged stub created when a new S3 object is first seen. */
export function stubFromCatalogItem(item: CatalogItem): ClipRecord {
  return ClipRecordSchema.parse({
    id: clipIdFromUri(item.uri),
    s3Uri: item.uri,
    sourcePrefix: item.sourcePrefix,
    mediaType: item.kind,
    key: item.key,
    nature: [],
    tags: [],
    usedInShorts: [],
  });
}

export function parseClipInventory(input: unknown): ClipInventory {
  return ClipInventorySchema.parse(input);
}

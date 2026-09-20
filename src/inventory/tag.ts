import {z} from "zod";
import {NATURE_TAGS, type ClipInventory, type ClipRecord, type NatureTag} from "./schema";

export type TagPatch = {
  visualRichness?: number;
  engagement?: number;
  hookPotential?: number;
  nature?: NatureTag[];
  tags?: string[];
  notes?: string;
  taggedBy?: string;
  usedInShorts?: string[];
};

/** Applies a manual tag patch. Nature/tags union with existing values. */
export function applyTagPatch(
  inventory: ClipInventory,
  id: string,
  patch: TagPatch,
  now = () => new Date().toISOString(),
): ClipInventory {
  const index = inventory.clips.findIndex((clip) => clip.id === id);
  if (index < 0) {
    throw new Error(`Unknown clip id: ${id}`);
  }
  const current = inventory.clips[index]!;
  const next = [...inventory.clips];
  next[index] = mergeClip(current, patch, now());
  return {version: inventory.version, clips: next};
}

function mergeClip(current: ClipRecord, patch: TagPatch, taggedAt: string): ClipRecord {
  return {
    ...current,
    visualRichness: patch.visualRichness ?? current.visualRichness,
    engagement: patch.engagement ?? current.engagement,
    hookPotential: patch.hookPotential ?? current.hookPotential,
    nature: uniqueNature([...(current.nature ?? []), ...(patch.nature ?? [])]),
    tags: uniqueStrings([...(current.tags ?? []), ...(patch.tags ?? [])]),
    notes: patch.notes ?? current.notes,
    taggedBy: patch.taggedBy ?? current.taggedBy,
    taggedAt,
    usedInShorts: uniqueStrings([
      ...(current.usedInShorts ?? []),
      ...(patch.usedInShorts ?? []),
    ]),
  };
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function uniqueNature(values: string[]): NatureTag[] {
  const allowed = new Set<string>(NATURE_TAGS);
  return uniqueStrings(values).filter((tag): tag is NatureTag => allowed.has(tag));
}

const TagPatchSchema = z.object({
  visualRichness: z.number().int().min(1).max(5).optional(),
  engagement: z.number().int().min(1).max(5).optional(),
  hookPotential: z.number().int().min(1).max(5).optional(),
  nature: z.array(z.enum(NATURE_TAGS)).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  taggedBy: z.string().optional(),
  usedInShorts: z.array(z.string()).optional(),
});

/** Parses `npm run inventory:tag -- <id> --richness 5 --tags mech-flex,horror`. */
export function parseTagCliArgs(argv: string[]): {id: string; patch: TagPatch} {
  const tokens = [...argv];
  const id = readId(tokens);
  const json = flagValue(tokens, "--json");
  if (json) {
    return {id, patch: TagPatchSchema.parse(JSON.parse(json))};
  }
  return {id, patch: readPatch(tokens)};
}

function readId(tokens: string[]): string {
  const flag = tokens.findIndex((token) => token === "--id");
  if (flag >= 0 && tokens[flag + 1]) {
    return tokens[flag + 1]!;
  }
  const skip = new Set([
    "--id",
    "--richness",
    "--engagement",
    "--hook",
    "--tags",
    "--notes",
    "--by",
    "--json",
  ]);
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token) {
      continue;
    }
    if (skip.has(token)) {
      i += 1;
      continue;
    }
    if (!token.startsWith("--")) {
      return token;
    }
  }
  throw new Error("Pass a clip id: npm run inventory:tag -- <id> --richness 5");
}

function readPatch(tokens: string[]): TagPatch {
  const patch: TagPatch = {};
  const richness = flagValue(tokens, "--richness");
  const engagement = flagValue(tokens, "--engagement");
  const hook = flagValue(tokens, "--hook");
  if (richness) {
    patch.visualRichness = Number(richness);
  }
  if (engagement) {
    patch.engagement = Number(engagement);
  }
  if (hook) {
    patch.hookPotential = Number(hook);
  }
  const tagList = flagValue(tokens, "--tags");
  if (tagList) {
    patch.nature = uniqueNature(tagList.split(",").map((part) => part.trim()));
    patch.tags = tagList
      .split(",")
      .map((part) => part.trim())
      .filter((part) => !NATURE_TAGS.includes(part as NatureTag));
  }
  const notes = flagValue(tokens, "--notes");
  if (notes) {
    patch.notes = notes;
  }
  const taggedBy = flagValue(tokens, "--by");
  if (taggedBy) {
    patch.taggedBy = taggedBy;
  }
  return patch;
}

function flagValue(tokens: string[], name: string): string | undefined {
  const index = tokens.indexOf(name);
  if (index < 0) {
    return undefined;
  }
  return tokens[index + 1];
}

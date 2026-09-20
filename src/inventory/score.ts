import type {ClipRecord} from "./schema";

/**
 * Manual engagement heuristic used by the story selector.
 * Untagged clips score 0 so tagged, richer plates win.
 */
export function clipScore(clip: ClipRecord | undefined): number {
  if (!clip) {
    return 0;
  }
  const hook = clip.hookPotential ?? 0;
  return (clip.visualRichness ?? 0) + (clip.engagement ?? 0) + hook * 0.5;
}

export function findClipByUri(
  inventory: {clips: ClipRecord[]} | undefined,
  s3Uri: string,
): ClipRecord | undefined {
  return inventory?.clips.find((clip) => clip.s3Uri === s3Uri);
}

import type {NatureTag} from "../inventory/schema";

/** How the operator said this ship should show up in Shorts. */
export const PRESERVE_USES = [
  "smash-cut-short",
  "expectation-vs-reality",
  "wip-flex",
  "bug-comedy",
  "hangar-process",
  "trailer-b-roll",
] as const;

export type PreserveUse = (typeof PRESERVE_USES)[number];

const NATURE_BY_USE: Record<PreserveUse, NatureTag[]> = {
  "smash-cut-short": ["gameplay", "absurd"],
  "expectation-vs-reality": ["wip", "absurd"],
  "wip-flex": ["wip", "mech-flex"],
  "bug-comedy": ["bug", "absurd"],
  "hangar-process": ["hangar", "wip"],
  "trailer-b-roll": ["b-roll"],
};

/** Suggested nature buckets. Unknown / "no" returns an empty list. */
export function natureForPreserveUse(use: string): NatureTag[] {
  return NATURE_BY_USE[use as PreserveUse] ?? [];
}

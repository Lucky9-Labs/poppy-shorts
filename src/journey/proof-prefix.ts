const PREFERRED = /proof|wip-evidence|showme|captures/i;

/**
 * Pick a short-lived proof / WIP folder from `contentSources`.
 * Gameplay and brand prefixes are last-resort fallbacks.
 */
export function chooseProofPrefix(sources: string[]): string | null {
  return sources.find((source) => PREFERRED.test(source)) ?? sources[0] ?? null;
}

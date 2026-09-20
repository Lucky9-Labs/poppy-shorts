/**
 * Helpers for optional SFX slots. Licensed files are dropped into `sfx/`;
 * Remotion serves them from `public/sfx` (a symlink to `../sfx`).
 * Missing files are skipped so the example Short can render without binaries.
 */

export type StaticFileRef = {
  name: string;
};

/**
 * Normalizes a cue path to `category/filename` (no leading slash, no `sfx/`).
 */
export function normalizeSfxPath(src: string): string {
  return src.replace(/^\/+/, "").replace(/^sfx\//, "");
}

/** True when the cue is a hosted URL instead of a dropped local file. */
export function isRemoteSfxSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/**
 * Finds a dropped SFX file in Remotion's public file list.
 * Returns the public-relative name (`sfx/whoosh/cut.wav`) or null.
 */
export function matchSfxFile(
  files: readonly StaticFileRef[],
  relativePath: string,
): string | null {
  const normalized = normalizeSfxPath(relativePath);
  const expected = `sfx/${normalized}`;
  const match = files.find((file) => file.name === expected);
  return match ? match.name : null;
}

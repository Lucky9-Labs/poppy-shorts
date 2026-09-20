import {staticFile} from "remotion";

/**
 * Resolves a beat media path. Remote URLs pass through; local files are
 * loaded from Remotion's `public/` folder via `staticFile()`.
 */
export function resolveMediaSrc(src: string): string {
  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  return staticFile(src.replace(/^\/+/, ""));
}

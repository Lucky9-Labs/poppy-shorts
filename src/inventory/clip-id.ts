/**
 * Stable inventory ids derived from `s3://bucket/key`.
 * Same object always maps to the same id so tags survive re-ingest.
 */
export function clipIdFromUri(s3Uri: string): string {
  const slug = s3Uri
    .trim()
    .replace(/^s3:\/\//i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (!slug) {
    throw new Error(`Cannot derive a clip id from ${JSON.stringify(s3Uri)}`);
  }
  return slug.slice(0, 120);
}

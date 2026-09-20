/**
 * Parse and normalize `s3://bucket/prefix` folder paths.
 * Used by the catalog helpers and the Node prep script — safe to import from Remotion.
 */

export type S3Location = {
  bucket: string;
  prefix: string;
};

const S3_URI = /^s3:\/\/([^/]+)(?:\/(.*))?$/i;

/**
 * Parses an S3 URI. Folder prefixes always end with `/` so ListObjects
 * matches only keys under that folder. A bucket-only URI uses `""`.
 */
export function parseS3Uri(input: string): S3Location {
  const trimmed = input.trim();
  const match = S3_URI.exec(trimmed);
  if (!match?.[1]) {
    throw new Error(
      `Expected an s3://bucket/prefix path, received ${JSON.stringify(input)}`,
    );
  }

  const rest = match[2] ?? "";
  const prefix = rest && !rest.endsWith("/") ? `${rest}/` : rest;
  return {bucket: match[1], prefix};
}

/** Builds `s3://bucket/key` for a single object (no forced trailing slash). */
export function toS3Uri(bucket: string, key: string): string {
  return `s3://${bucket}/${key.replace(/^\/+/, "")}`;
}

/** Rebuilds a normalized folder URI (`s3://bucket/prefix/`). */
export function toS3PrefixUri(location: S3Location): string {
  return location.prefix
    ? `s3://${location.bucket}/${location.prefix}`
    : `s3://${location.bucket}`;
}

export type ContentKind = "image" | "video" | "audio" | "other";

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp"]);
const VIDEO_EXT = new Set(["mp4", "mov", "webm", "mkv", "m4v"]);
const AUDIO_EXT = new Set(["wav", "mp3", "ogg", "aiff", "flac", "m4a", "aac"]);

/** Classifies a key by file extension. Folder keys are `other`. */
export function classifyContentKind(key: string): ContentKind {
  const base = key.split("/").pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return "other";
  }
  const ext = base.slice(dot + 1).toLowerCase();
  if (IMAGE_EXT.has(ext)) {
    return "image";
  }
  if (VIDEO_EXT.has(ext)) {
    return "video";
  }
  if (AUDIO_EXT.has(ext)) {
    return "audio";
  }
  return "other";
}

import path from "node:path";
import {parseS3Uri, toS3Uri} from "../lib/s3-uri";

/** Stable local identity when artifacts are not yet in a contentSources bucket. */
export function toFileUri(localPath: string): string {
  const trimmed = localPath.trim();
  if (trimmed.startsWith("s3://") || trimmed.startsWith("file:")) {
    return trimmed;
  }
  return `file:${trimmed.replace(/^\.\//, "")}`;
}

/**
 * If the operator published into an S3 prefix, inventory ids follow the object
 * key. Otherwise keep a `file:` uri so tags survive a later upload rewrite.
 */
export function publishedArtifactUri(localPath: string, prefix?: string): string {
  const trimmed = localPath.trim();
  if (trimmed.startsWith("s3://")) {
    return trimmed;
  }
  if (prefix?.startsWith("s3://")) {
    const location = parseS3Uri(prefix);
    return toS3Uri(location.bucket, `${location.prefix}${path.basename(trimmed)}`);
  }
  return toFileUri(trimmed);
}

/** Folder identity used as `sourcePrefix` for a journey artifact uri. */
export function artifactSourcePrefix(uri: string): string {
  if (uri.startsWith("s3://")) {
    const location = parseS3Uri(uri.replace(/\/[^/]+$/, "/"));
    return `s3://${location.bucket}/${location.prefix}`;
  }
  const withoutScheme = uri.replace(/^file:/, "");
  const slash = withoutScheme.lastIndexOf("/");
  return slash === -1 ? "file:" : `file:${withoutScheme.slice(0, slash + 1)}`;
}

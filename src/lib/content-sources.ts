import {parseS3Uri, toS3PrefixUri} from "./s3-uri";

/**
 * Normalizes composition props or a `CONTENT_SOURCES` env value into
 * unique `s3://bucket/prefix/` folder paths.
 */
export function parseContentSourcesInput(
  input: string[] | string | undefined,
): string[] {
  const raw = splitSources(input);
  const seen = new Set<string>();
  const sources: string[] = [];

  for (const entry of raw) {
    const normalized = toS3PrefixUri(parseS3Uri(entry));
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    sources.push(normalized);
  }

  return sources;
}

/** Reads `CONTENT_SOURCES` from the process env (prep script / agents). */
export function contentSourcesFromEnv(
  env: Record<string, string | undefined> = globalThis.process?.env ?? {},
): string[] {
  return parseContentSourcesInput(env.CONTENT_SOURCES);
}

function splitSources(input: string[] | string | undefined): string[] {
  if (input === undefined || input === "") {
    return [];
  }
  if (Array.isArray(input)) {
    return input.map((entry) => entry.trim()).filter(Boolean);
  }

  const trimmed = input.trim();
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("CONTENT_SOURCES JSON must be an array of s3:// paths");
    }
    return parsed.map((entry) => String(entry).trim()).filter(Boolean);
  }

  return trimmed
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

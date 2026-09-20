/**
 * Node prep script: list media under one or more S3 folder prefixes and
 * write `public/content-catalog.json` for Remotion compositions.
 *
 *   npm run catalog -- s3://bucket/gameplay/ s3://bucket/wip-evidence/
 *   CONTENT_SOURCES='["s3://bucket/gameplay/"]' npm run catalog
 *   npm run catalog -- --presign
 *
 * Uses the AWS default credential chain. Never pass secrets as flags.
 */

import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {parseContentSourcesInput} from "../lib/content-sources";
import {listContentSources} from "../lib/list-s3-content";
import {attachPresignedUrls, createS3ListClient} from "../lib/s3-client";
import {loadProjectConfig, resolveAwsRegion, resolveContentSources} from "../lib/project-config";

const OUTPUT = path.join(process.cwd(), "public", "content-catalog.json");

async function main(): Promise<void> {
  const {sources, presign} = parseArgs(process.argv.slice(2));
  const projectConfig = await loadProjectConfig();
  const contentSources = sources.length > 0 ? sources : resolveContentSources(projectConfig);

  if (contentSources.length === 0) {
    console.log(
      "No contentSources configured. Set CONTENT_SOURCES or pass s3:// paths.",
    );
    console.log("Example still renders offline with placeholder plates.");
    return;
  }

  const catalog = await listContentSources(
    createS3ListClient(resolveAwsRegion(projectConfig)),
    contentSources,
  );
  if (presign) {
    catalog.items = await attachPresignedUrls(catalog.items, 3600);
  }

  await mkdir(path.dirname(OUTPUT), {recursive: true});
  await writeFile(OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${catalog.items.length} items from ${catalog.sources.length} prefixes to ${OUTPUT}`,
  );
}

function parseArgs(argv: string[]): {sources: string[]; presign: boolean} {
  const sources: string[] = [];
  let presign = false;
  for (const arg of argv) {
    if (arg === "--presign") {
      presign = true;
      continue;
    }
    sources.push(arg);
  }
  return {sources: parseContentSourcesInput(sources), presign};
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

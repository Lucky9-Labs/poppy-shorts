/**
 * List S3 contentSources and upsert inventory stubs without wiping tags.
 *
 *   npm run inventory:sync
 *   npm run inventory:sync -- s3://bucket/gameplay/ s3://bucket/wip-evidence/
 */

import {emptyContentCatalog} from "../lib/content-catalog";
import {listContentSources} from "../lib/list-s3-content";
import {createS3ListClient} from "../lib/s3-client";
import {parseContentSourcesInput} from "../lib/content-sources";
import {mergeCatalogIntoInventory} from "../inventory/merge";
import {DEFAULT_INVENTORY_PATH, loadInventory, saveInventory} from "../inventory/persist";
import {loadProjectConfig, resolveAwsRegion, resolveContentSources} from "../lib/project-config";

async function main(): Promise<void> {
  const sources = parseContentSourcesInput(
    process.argv.slice(2).filter((arg) => arg.startsWith("s3://")),
  );
  const projectConfig = await loadProjectConfig();
  const contentSources = sources.length > 0 ? sources : resolveContentSources(projectConfig);
  const existing = await loadInventory();
  const catalog =
    contentSources.length === 0
      ? emptyContentCatalog()
      : await listContentSources(createS3ListClient(resolveAwsRegion(projectConfig)), contentSources);

  if (contentSources.length === 0) {
    console.log("No contentSources — keeping the current inventory (no S3 list).");
  }

  const merged = mergeCatalogIntoInventory(existing, catalog);
  await saveInventory(merged);
  const tagged = merged.clips.filter((clip) => (clip.visualRichness ?? 0) > 0).length;
  console.log(
    `Inventory ${DEFAULT_INVENTORY_PATH}: ${merged.clips.length} clips (${tagged} scored). New stubs keep empty tags.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

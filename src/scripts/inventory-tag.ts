/**
 * Patch one clip in inventory/clips.json.
 *
 *   npm run inventory:tag -- lucky9-clips-gameplay-flex-mp4 --richness 5 --engagement 4 --tags mech-flex,horror --notes "hook"
 *   npm run inventory:tag -- --id <id> --json '{"visualRichness":5,"notes":"hook"}'
 */

import {applyTagPatch, parseTagCliArgs} from "../inventory/tag";
import {DEFAULT_INVENTORY_PATH, loadInventory, saveInventory} from "../inventory/persist";

async function main(): Promise<void> {
  const {id, patch} = parseTagCliArgs(process.argv.slice(2));
  if (!patch.taggedBy) {
    patch.taggedBy = process.env.USER ?? "operator";
  }
  const next = applyTagPatch(await loadInventory(), id, patch);
  await saveInventory(next);
  const clip = next.clips.find((item) => item.id === id);
  console.log(`Tagged ${id} in ${DEFAULT_INVENTORY_PATH}`);
  console.log(JSON.stringify(clip, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

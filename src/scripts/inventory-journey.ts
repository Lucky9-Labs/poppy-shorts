/**
 * Upsert a journey package into inventory/clips.json without wiping tags.
 *
 *   npm run inventory:journey -- ./journeys/loadout.json
 */

import {readFile} from "node:fs/promises";
import {mergeJourneyIntoInventory} from "../journey/inventory";
import {parseJourneyPackage} from "../journey/schema";
import {DEFAULT_INVENTORY_PATH, loadInventory, saveInventory} from "../inventory/persist";

async function main(): Promise<void> {
  const filePath = process.argv[2];
  if (!filePath) {
    throw new Error("Usage: npm run inventory:journey -- <journey.json>");
  }
  const pkg = parseJourneyPackage(JSON.parse(await readFile(filePath, "utf8")));
  const next = mergeJourneyIntoInventory(await loadInventory(), pkg);
  await saveInventory(next);
  const added = next.clips.filter((clip) => clip.notes === pkg.caption || clip.notes?.startsWith(pkg.caption));
  console.log(
    `Journey "${pkg.feature}" → ${DEFAULT_INVENTORY_PATH} (${pkg.artifacts.length} artifacts, ${added.length} matching notes).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

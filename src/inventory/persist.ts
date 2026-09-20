import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {emptyInventory, parseClipInventory} from "./schema";
import type {ClipInventory} from "./schema";

export const DEFAULT_INVENTORY_PATH = path.join(
  process.cwd(),
  "inventory",
  "clips.json",
);

/** Loads a versioned inventory, or an empty store if the file is missing. */
export async function loadInventory(
  filePath = DEFAULT_INVENTORY_PATH,
): Promise<ClipInventory> {
  try {
    const raw = await readFile(filePath, "utf8");
    return parseClipInventory(JSON.parse(raw));
  } catch (error) {
    if (isMissingFile(error)) {
      return emptyInventory();
    }
    throw error;
  }
}

/** Writes inventory JSON (pretty) so humans and agents can edit tags. */
export async function saveInventory(
  inventory: ClipInventory,
  filePath = DEFAULT_INVENTORY_PATH,
): Promise<void> {
  await mkdir(path.dirname(filePath), {recursive: true});
  await writeFile(filePath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

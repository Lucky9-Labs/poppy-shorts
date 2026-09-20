import {getStaticFiles, staticFile, type CalculateMetadataFunction} from "remotion";
import {ContentCatalogSchema, type ShortProps} from "./schema";
import {SHORTS_FPS, SHORTS_HEIGHT, SHORTS_WIDTH} from "./constants";
import {totalDurationInFrames} from "./timeline";

/**
 * Sizes a PoppyShort composition from its beat list and slugs the output name.
 * Attaches `public/content-catalog.json` when the prep script has been run.
 */
export const calculateShortMetadata: CalculateMetadataFunction<
  ShortProps
> = async ({props}) => {
  const catalog =
    props.catalog ??
    (typeof window === "undefined" ? null : await readPublicContentCatalog());

  return {
    ...buildShortMetadata(props),
    props: catalog ? {...props, catalog} : props,
  };
};

/** Pure metadata used by tests and calculateMetadata. */
export function buildShortMetadata(props: ShortProps) {
  const slug = props.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return {
    fps: SHORTS_FPS,
    width: SHORTS_WIDTH,
    height: SHORTS_HEIGHT,
    durationInFrames: totalDurationInFrames(props.beats, SHORTS_FPS),
    defaultOutName: slug || "poppy-short",
  };
}

/**
 * Loads a catalog written by `npm run catalog`. Missing files or running
 * outside Remotion (unit tests) return null so placeholders still work.
 */
export async function readPublicContentCatalog() {
  try {
    const listed = getStaticFiles().some(
      (file) => file.name === "content-catalog.json",
    );
    if (!listed) {
      return null;
    }
    const response = await fetch(staticFile("content-catalog.json"));
    if (!response.ok) {
      return null;
    }
    return ContentCatalogSchema.parse(await response.json());
  } catch {
    return null;
  }
}

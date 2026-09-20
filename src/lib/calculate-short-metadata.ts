import type {CalculateMetadataFunction} from "remotion";
import {SHORTS_FPS, SHORTS_HEIGHT, SHORTS_WIDTH} from "./constants";
import type {ShortProps} from "./schema";
import {totalDurationInFrames} from "./timeline";

/**
 * Sizes a PoppyShort composition from its beat list and slugs the output name.
 */
export const calculateShortMetadata: CalculateMetadataFunction<
  ShortProps
> = ({props}) => {
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
};

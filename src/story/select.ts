import {catalogItemsOfKind} from "../lib/content-catalog";
import type {ContentCatalog} from "../lib/content-catalog";
import type {BeatSource} from "../lib/schema";
import type {StoryBeat} from "./types";

const PLACEHOLDER_COLORS = ["#0b0f14", "#2a1840", "#1a0c0c", "#14301c", "#101820"];

/** Splits narration / transcript text into smash-cut caption lines. */
export function splitNarration(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Duration from word count, clamped to Short smash-cut pacing. */
export function beatDurationSeconds(line: string): number {
  const words = line.split(/\s+/).filter(Boolean).length;
  const raw = Math.max(0.8, Math.min(2, words * 0.35));
  return Math.round(raw * 10) / 10;
}

/**
 * Picks plates from the catalog (video first, then images) or placeholders.
 * Alternates serious / goofy so juxtaposition stays in the cut.
 */
export function selectStoryBeats(input: {
  lines: string[];
  catalog: ContentCatalog;
}): StoryBeat[] {
  const videos = catalogItemsOfKind(input.catalog, "video");
  const images = catalogItemsOfKind(input.catalog, "image");

  return input.lines.map((line, index) => {
    const tone = index % 2 === 0 ? "serious" : "goofy";
    return {
      id: `beat-${index + 1}`,
      line,
      tone,
      durationInSeconds: beatDurationSeconds(line),
      source: pickSource(videos, images, index),
    };
  });
}

function pickSource(
  videos: ReturnType<typeof catalogItemsOfKind>,
  images: ReturnType<typeof catalogItemsOfKind>,
  index: number,
): BeatSource {
  const video = videos[index];
  if (video?.url) {
    return {type: "video", src: video.url};
  }
  const image = images[index];
  if (image?.url) {
    return {type: "image", src: image.url};
  }
  if (video) {
    return {type: "catalog", kind: "video", index, fallbackLabel: video.key};
  }
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length] ?? "#0b0f14";
  return {type: "placeholder", color, label: `CLIP ${index + 1}`};
}

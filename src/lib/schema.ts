import {z} from "zod";
import {VoiceConfigSchema} from "../story/config";

/**
 * Zod schemas for a prop-driven poppy-shorts composition.
 * Agents and Remotion Studio edit these props to author a new Short.
 */

const PlaceholderSourceSchema = z.object({
  type: z.literal("placeholder"),
  color: z.string(),
  label: z.string().optional(),
});

const ImageSourceSchema = z.object({
  type: z.literal("image"),
  src: z.string().min(1),
});

const VideoSourceSchema = z.object({
  type: z.literal("video"),
  src: z.string().min(1),
  volume: z.number().min(0).max(1).optional(),
});

/**
 * Pulls the Nth image/video from the merged S3 catalog.
 * Falls back to a generated plate when the catalog is empty (offline).
 */
export const CatalogBeatSourceSchema = z.object({
  type: z.literal("catalog"),
  kind: z.enum(["image", "video", "audio"]),
  index: z.number().int().nonnegative(),
  fallbackColor: z.string().optional(),
  fallbackLabel: z.string().optional(),
});

/** Visual source for one smash-cut beat. Placeholders need no media files. */
export const BeatSourceSchema = z.discriminatedUnion("type", [
  PlaceholderSourceSchema,
  ImageSourceSchema,
  VideoSourceSchema,
  CatalogBeatSourceSchema,
]);

/** On-screen caption that pops after the cut (serious vs goofy tone). */
export const CaptionSchema = z.object({
  text: z.string().min(1),
  tone: z.enum(["serious", "goofy"]),
  delaySeconds: z.number().nonnegative().optional(),
});

/** Timestamped SFX slot. `src` is a path under `sfx/` or an http(s) URL. */
export const SfxCueSchema = z.object({
  src: z.string().min(1),
  atSeconds: z.number().nonnegative(),
  kind: z.enum(["whoosh", "impact", "comedy"]),
  volume: z.number().min(0).max(1).optional(),
});

/** One smash-cut beat: picture, caption, and optional SFX cues. */
export const BeatSchema = z.object({
  id: z.string().min(1),
  durationInSeconds: z.number().positive(),
  source: BeatSourceSchema,
  caption: CaptionSchema.optional(),
  sfx: z.array(SfxCueSchema).optional(),
});

export const CatalogItemSchema = z.object({
  uri: z.string().min(1),
  bucket: z.string().min(1),
  key: z.string().min(1),
  kind: z.enum(["image", "video", "audio"]),
  sourcePrefix: z.string().min(1),
  sizeBytes: z.number().nonnegative().optional(),
  url: z.string().optional(),
});

/** Merged listing of every `contentSources` prefix for this render. */
export const ContentCatalogSchema = z.object({
  sources: z.array(z.string()),
  items: z.array(CatalogItemSchema),
});

/** Optional Fish Audio / offline VO knobs (no API keys). */
export const VoiceoverTrackSchema = z.object({
  src: z.string().min(1),
  volume: z.number().min(0).max(1).optional(),
});

/** Top-level props for the reusable PoppyShort composition. */
export const ShortPropsSchema = z.object({
  title: z.string().min(1),
  beats: z.array(BeatSchema).min(1),
  contentSources: z.array(z.string()).default([]),
  catalog: ContentCatalogSchema.optional(),
  voice: VoiceConfigSchema.optional(),
  voiceover: VoiceoverTrackSchema.optional(),
});

export type BeatSource = z.infer<typeof BeatSourceSchema>;
export type CatalogBeatSource = z.infer<typeof CatalogBeatSourceSchema>;
export type Caption = z.infer<typeof CaptionSchema>;
export type SfxCue = z.infer<typeof SfxCueSchema>;
export type Beat = z.infer<typeof BeatSchema>;
export type VoiceoverTrack = z.infer<typeof VoiceoverTrackSchema>;
export type ShortProps = z.infer<typeof ShortPropsSchema>;

/** Parses and validates Short props. Throws a ZodError on invalid input. */
export function parseShortProps(input: unknown): ShortProps {
  return ShortPropsSchema.parse(input);
}

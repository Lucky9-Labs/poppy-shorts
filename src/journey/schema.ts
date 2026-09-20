import {z} from "zod";

/** On-disk journey package written after a start→finish capture. */
export const JOURNEY_VERSION = 1 as const;

export const JourneyArtifactSchema = z.object({
  role: z.enum(["start", "end", "motion"]),
  path: z.string().min(1),
  mediaType: z.enum(["image", "video"]).optional(),
});

export const JourneyRuntimeSchema = z.object({
  identity: z.string().min(1).optional(),
  commit: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
});

export const JourneyPackageSchema = z.object({
  version: z.literal(JOURNEY_VERSION),
  feature: z.string().min(1),
  caption: z.string().min(1),
  runtime: JourneyRuntimeSchema.optional(),
  artifacts: z.array(JourneyArtifactSchema).min(1),
  publishedPrefix: z.string().min(1).optional(),
});

export type JourneyArtifact = z.infer<typeof JourneyArtifactSchema>;
export type JourneyRuntime = z.infer<typeof JourneyRuntimeSchema>;
export type JourneyPackage = z.infer<typeof JourneyPackageSchema>;

/** Validates a journey package. Agents write this JSON, then upsert inventory. */
export function parseJourneyPackage(input: unknown): JourneyPackage {
  return JourneyPackageSchema.parse(input);
}

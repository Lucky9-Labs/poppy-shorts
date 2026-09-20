import {z} from "zod";

/**
 * Storytelling knobs for poppy-shorts.
 * Secrets stay in the environment (`FISH_AUDIO_API_KEY`, AWS chain) — never here.
 */

export const VoiceConfigSchema = z.object({
  provider: z.enum(["fish_audio", "offline"]).default("offline"),
  /** Fish Audio voice / model id passed as `reference_id` on TTS. */
  referenceId: z.string().min(1).optional(),
  /** Fish `model` header (for example `s2.1-pro`). */
  model: z.string().min(1).optional(),
});

export const TranscribeConfigSchema = z.object({
  provider: z.enum(["openai_whisper", "offline"]).default("offline"),
});

export const StoryConfigSchema = z.object({
  title: z.string().min(1),
  channel: z.string().optional(),
  contentSources: z.array(z.string()).default([]),
  voice: VoiceConfigSchema.optional(),
  transcribe: TranscribeConfigSchema.optional(),
  /** Seed narration when Whisper is offline or you already wrote the VO. */
  narration: z.string().optional(),
});

export type VoiceConfig = z.infer<typeof VoiceConfigSchema>;
export type TranscribeConfig = z.infer<typeof TranscribeConfigSchema>;
export type StoryConfig = z.infer<typeof StoryConfigSchema>;

/** Parses storytelling config. Throws a ZodError on invalid input. */
export function parseStoryConfig(input: unknown): StoryConfig {
  return StoryConfigSchema.parse(input);
}

/** Reads optional Fish / Whisper knobs from env without storing secrets. */
export function storyConfigFromEnv(
  env: Record<string, string | undefined> = globalThis.process?.env ?? {},
): Pick<StoryConfig, "voice" | "transcribe"> {
  const referenceId = env.FISH_AUDIO_REFERENCE_ID?.trim();
  const hasFishKey = Boolean(env.FISH_AUDIO_API_KEY?.trim());

  return {
    voice: {
      provider: hasFishKey && referenceId ? "fish_audio" : "offline",
      referenceId: referenceId || undefined,
      model: env.FISH_AUDIO_MODEL?.trim() || undefined,
    },
    transcribe: {
      provider: env.OPENAI_API_KEY?.trim() ? "openai_whisper" : "offline",
    },
  };
}

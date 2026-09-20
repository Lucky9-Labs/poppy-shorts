import {emptyContentCatalog} from "../lib/content-catalog";
import type {ContentCatalog} from "../lib/content-catalog";
import type {ClipInventory} from "../inventory/schema";
import type {S3ListClient} from "../lib/list-s3-content";
import {assembleStoryShort} from "./assemble";
import type {StoryConfig} from "./config";
import {ingestContentSources} from "./ingest";
import {selectStoryBeats, splitNarration} from "./select";
import {createOfflineTranscriber, type Transcriber} from "./transcribe";
import type {StoryPipelineResult, Transcript, VoiceoverResult} from "./types";
import {createOfflineVoiceProvider, type VoiceProvider} from "./voice/provider";

export type StoryPipelineDeps = {
  lister?: S3ListClient;
  transcriber?: Transcriber;
  voice?: VoiceProvider;
  catalog?: ContentCatalog;
  inventory?: ClipInventory;
  writeVoiceover?: (result: VoiceoverResult) => Promise<string>;
};

/**
 * ingest → transcribe → select → optional VO → Remotion assemble.
 * Missing AWS / Fish / Whisper adapters skip that stage instead of failing.
 */
export async function runStoryPipeline(input: {
  config: StoryConfig;
  catalog?: ContentCatalog;
  inventory?: ClipInventory;
  lister?: S3ListClient;
  transcriber?: Transcriber;
  voice?: VoiceProvider;
  writeVoiceover?: (result: VoiceoverResult) => Promise<string>;
}): Promise<StoryPipelineResult> {
  const ingested = await ingestContentSources({
    contentSources: input.config.contentSources,
    catalog: input.catalog,
    lister: input.lister,
  });
  const transcript = await loadTranscript(input.config, input.transcriber);
  const lines = linesFromTranscript(transcript, input.config.narration);
  const beats = selectStoryBeats({
    lines,
    catalog: ingested.catalog,
    inventory: input.inventory,
  });
  const voiceover = await maybeVoiceover(input, lines.join(". "));

  return {
    config: input.config,
    catalog: ingested.catalog,
    transcript,
    skipped: {
      ingest: ingested.skipped,
      transcribe: !input.config.narration && transcript.segments.length === 0,
      voiceover: !voiceover,
    },
    short: assembleStoryShort({
      title: input.config.title,
      contentSources: input.config.contentSources,
      beats,
      voice: input.config.voice,
      voiceover,
    }),
  };
}

async function loadTranscript(
  config: StoryConfig,
  transcriber: Transcriber | undefined,
): Promise<Transcript> {
  const backend = transcriber ?? createOfflineTranscriber();
  return backend.transcribe({text: config.narration});
}

function linesFromTranscript(transcript: Transcript, narration?: string): string[] {
  if (transcript.segments.length > 0) {
    return transcript.segments.map((segment) => segment.text);
  }
  return splitNarration(narration ?? "New Short. Add narration or a transcript.");
}

async function maybeVoiceover(
  input: {
    config: StoryConfig;
    voice?: VoiceProvider;
    writeVoiceover?: (result: VoiceoverResult) => Promise<string>;
  },
  text: string,
) {
  const wantsFish = input.config.voice?.provider === "fish_audio";
  if (!wantsFish || !input.voice || input.voice.id === "offline") {
    return undefined;
  }
  try {
    const result = await input.voice.generateSpeech({
      text,
      referenceId: input.config.voice?.referenceId,
    });
    if (!input.writeVoiceover) {
      return undefined;
    }
    const src = await input.writeVoiceover(result);
    return {src, volume: 0.85};
  } catch {
    return undefined;
  }
}

/** Default deps for an offline dry run (no AWS SDK, no Fish). */
export function offlineStoryDeps(): StoryPipelineDeps {
  return {
    catalog: emptyContentCatalog(),
    transcriber: createOfflineTranscriber(),
    voice: createOfflineVoiceProvider(),
  };
}

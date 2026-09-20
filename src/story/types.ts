import type {BeatSource, ShortProps, VoiceoverTrack} from "../lib/schema";
import type {ContentCatalog} from "../lib/content-catalog";
import type {StoryConfig, VoiceConfig} from "./config";

/** One selected smash-cut before Remotion assemble. */
export type StoryBeat = {
  id: string;
  line: string;
  tone: "serious" | "goofy";
  durationInSeconds: number;
  source: BeatSource;
};

/** Word-level transcript spine (Whisper-style). Adapters may omit words. */
export type TranscriptWord = {
  text: string;
  startSeconds: number;
  endSeconds: number;
};

export type TranscriptSegment = {
  text: string;
  startSeconds?: number;
  endSeconds?: number;
  words?: TranscriptWord[];
};

export type Transcript = {
  text: string;
  segments: TranscriptSegment[];
};

export type VoiceoverResult = {
  bytes: Uint8Array;
  mimeType: string;
};

export type StoryPipelineResult = {
  config: StoryConfig;
  catalog: ContentCatalog;
  transcript: Transcript;
  short: ShortProps;
  skipped: {
    ingest: boolean;
    transcribe: boolean;
    voiceover: boolean;
  };
};

export type AssembleInput = {
  title: string;
  contentSources: string[];
  beats: StoryBeat[];
  voice?: VoiceConfig;
  voiceover?: VoiceoverTrack;
};

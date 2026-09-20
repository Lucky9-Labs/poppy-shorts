import type {Transcript} from "./types";
import {splitNarration} from "./select";

/** Pluggable transcript backend. Offline never calls a network. */
export type Transcriber = {
  readonly id: "openai_whisper" | "offline";
  transcribe: (input: {mediaUrl?: string; text?: string}) => Promise<Transcript>;
};

/** Builds a transcript from written narration (no Whisper / no files). */
export function transcriptFromNarration(text: string): Transcript {
  const segments = splitNarration(text).map((line) => ({text: line}));
  return {text, segments};
}

export function createOfflineTranscriber(): Transcriber {
  return {
    id: "offline",
    async transcribe({text}) {
      if (!text?.trim()) {
        return {text: "", segments: []};
      }
      return transcriptFromNarration(text);
    },
  };
}

/**
 * Request shape for OpenAI Audio Transcriptions (public API).
 * The adapter is injected with fetch so tests never hit the network.
 */
export function buildOpenAIWhisperUrl(): string {
  return "https://api.openai.com/v1/audio/transcriptions";
}

export function createOpenAIWhisperTranscriber(input: {
  apiKey: string;
  fetchImpl?: typeof fetch;
}): Transcriber {
  return {
    id: "openai_whisper",
    async transcribe({mediaUrl, text}) {
      if (!input.apiKey.trim()) {
        throw new Error("OPENAI_API_KEY is required for openai_whisper");
      }
      if (!mediaUrl) {
        return transcriptFromNarration(text ?? "");
      }
      const fetchImpl = input.fetchImpl ?? fetch;
      const body = new FormData();
      body.append("model", "whisper-1");
      body.append("file", mediaUrl);
      body.append("response_format", "verbose_json");
      const response = await fetchImpl(buildOpenAIWhisperUrl(), {
        method: "POST",
        headers: {Authorization: `Bearer ${input.apiKey}`},
        body,
      });
      if (!response.ok) {
        throw new Error(`OpenAI Whisper failed: ${response.status}`);
      }
      const json = (await response.json()) as {text?: string};
      return transcriptFromNarration(json.text ?? text ?? "");
    },
  };
}

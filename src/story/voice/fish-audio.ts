import type {VoiceProvider} from "./provider";
import type {VoiceoverResult} from "../types";

/**
 * Fish Audio adapter from the public HTTP API
 * (https://docs.fish.audio) — not a copy of any Lucky9 product client.
 */

export const FISH_TTS_URL = "https://api.fish.audio/v1/tts";
export const FISH_MODEL_URL = "https://api.fish.audio/model";

export type FishTtsRequest = {
  url: string;
  headers: {Authorization: string; "Content-Type": string; model: string};
  body: {text: string; reference_id: string; format: "mp3"};
};

export function buildFishTtsRequest(input: {
  apiKey: string;
  text: string;
  referenceId: string;
  model?: string;
}): FishTtsRequest {
  return {
    url: FISH_TTS_URL,
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      model: input.model ?? "s2.1-pro",
    },
    body: {
      text: input.text,
      reference_id: input.referenceId,
      format: "mp3",
    },
  };
}

/** Persistent clone via POST /model (multipart fields; files added by caller). */
export function buildFishCloneRequest(input: {apiKey: string; title: string}) {
  return {
    url: FISH_MODEL_URL,
    headers: {Authorization: `Bearer ${input.apiKey}`},
    fields: {
      type: "tts",
      title: input.title,
      visibility: "private",
      train_mode: "fast",
    },
  };
}

export function createFishAudioProvider(input: {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
}): VoiceProvider {
  return {
    id: "fish_audio",
    async generateSpeech({text, referenceId}) {
      return generateFishSpeech({...input, text, referenceId});
    },
  };
}

async function generateFishSpeech(input: {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
  text: string;
  referenceId?: string;
}): Promise<VoiceoverResult> {
  if (!input.apiKey.trim()) {
    throw new Error("FISH_AUDIO_API_KEY is required for fish_audio TTS");
  }
  if (!input.referenceId) {
    throw new Error("voice.referenceId is required for fish_audio TTS");
  }
  const request = buildFishTtsRequest({
    apiKey: input.apiKey,
    text: input.text,
    referenceId: input.referenceId,
    model: input.model,
  });
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(request.body),
  });
  if (!response.ok) {
    throw new Error(`Fish Audio TTS failed: ${response.status}`);
  }
  return {bytes: new Uint8Array(await response.arrayBuffer()), mimeType: "audio/mpeg"};
}

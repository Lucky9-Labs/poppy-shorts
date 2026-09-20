import type {VoiceoverResult} from "../types";

/** Swap Fish Audio / offline / future providers without touching Remotion. */
export type VoiceProvider = {
  readonly id: "fish_audio" | "offline";
  generateSpeech: (input: {
    text: string;
    referenceId?: string;
  }) => Promise<VoiceoverResult>;
  createClone?: (input: {
    title: string;
    audioUrls: string[];
  }) => Promise<{referenceId: string; state: string}>;
};

export function createOfflineVoiceProvider(): VoiceProvider {
  return {
    id: "offline",
    async generateSpeech() {
      throw new Error("Voiceover skipped: voice.provider is offline");
    },
  };
}

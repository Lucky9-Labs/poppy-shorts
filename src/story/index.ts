/**
 * Open-source storytelling adapters for poppy-shorts.
 * Inspired by Lucky9 Restart patterns; not a fork of that codebase.
 */
export {parseStoryConfig, storyConfigFromEnv, StoryConfigSchema} from "./config";
export type {StoryConfig, VoiceConfig} from "./config";
export {runStoryPipeline, offlineStoryDeps} from "./pipeline";
export {assembleStoryShort} from "./assemble";
export {selectStoryBeats, splitNarration} from "./select";
export type {ClipInventory} from "../inventory/schema";
export {ingestContentSources} from "./ingest";
export {createOfflineTranscriber, createOpenAIWhisperTranscriber} from "./transcribe";
export {createOfflineVoiceProvider} from "./voice/provider";
export {createFishAudioProvider, buildFishTtsRequest} from "./voice/fish-audio";

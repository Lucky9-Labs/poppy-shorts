import type {Beat, ShortProps, SfxCue} from "../lib/schema";
import type {AssembleInput, StoryBeat} from "./types";

/**
 * Maps a story plan onto Remotion `ShortProps`: captions, smash-cut SFX
 * slots, optional Fish Audio VO track. Does not call AWS or Fish.
 */
export function assembleStoryShort(input: AssembleInput): ShortProps {
  return {
    title: input.title,
    contentSources: input.contentSources,
    beats: input.beats.map(toRemotionBeat),
    voice: input.voice,
    voiceover: input.voiceover,
  };
}

function toRemotionBeat(beat: StoryBeat): Beat {
  return {
    id: beat.id,
    durationInSeconds: beat.durationInSeconds,
    source: beat.source,
    caption: {
      text: beat.line,
      tone: beat.tone,
      delaySeconds: beat.tone === "goofy" ? 0.08 : 0.06,
    },
    sfx: smashCutSfx(beat.tone),
  };
}

/** Whoosh on the cut for serious plates; impact when the joke lands. */
function smashCutSfx(tone: StoryBeat["tone"]): SfxCue[] {
  if (tone === "serious") {
    return [{src: "whoosh/cut-01.wav", atSeconds: 0, kind: "whoosh", volume: 0.85}];
  }
  return [{src: "impact/hit-01.wav", atSeconds: 0.08, kind: "impact", volume: 0.9}];
}

import React from "react";
import {Audio} from "remotion";
import type {VoiceoverTrack as VoiceoverTrackProps} from "../lib/schema";
import {resolveMediaSrc} from "../lib/resolve-media";

/**
 * Optional narration bed under smash cuts.
 * Missing src (offline / no Fish run) renders nothing.
 */
export const VoiceoverTrack: React.FC<{
  readonly voiceover?: VoiceoverTrackProps;
}> = ({voiceover}) => {
  if (!voiceover?.src) {
    return null;
  }

  return (
    <Audio
      src={resolveMediaSrc(voiceover.src)}
      volume={() => voiceover.volume ?? 0.85}
    />
  );
};

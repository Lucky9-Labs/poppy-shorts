import React from "react";
import {Audio, getStaticFiles, Sequence, staticFile} from "remotion";
import type {SfxCue} from "../lib/schema";
import {isRemoteSfxSrc, matchSfxFile} from "../lib/sfx";
import {secondsToFrames} from "../lib/timeline";

type SfxLayerProps = {
  readonly cues: SfxCue[];
  readonly fps: number;
};

/**
 * Resolves one cue to a Remotion-playable src, or null if the file is absent.
 * Missing local SFX are skipped so example renders stay binary-free.
 */
export function resolvePlayableSfxSrc(cue: SfxCue): string | null {
  if (isRemoteSfxSrc(cue.src)) {
    return cue.src;
  }
  const match = matchSfxFile(getStaticFiles(), cue.src);
  return match ? staticFile(match) : null;
}

/**
 * Places whoosh / impact / comedy one-shots on the beat-local timeline.
 */
export const SfxLayer: React.FC<SfxLayerProps> = ({cues, fps}) => {
  return (
    <>
      {cues.map((cue, index) => {
        const src = resolvePlayableSfxSrc(cue);
        if (!src) {
          return null;
        }
        return (
          <Sequence
            key={`${cue.kind}-${cue.src}-${index}`}
            from={secondsToFrames(cue.atSeconds, fps)}
            name={`sfx-${cue.kind}`}
          >
            <Audio src={src} volume={() => cue.volume ?? 1} />
          </Sequence>
        );
      })}
    </>
  );
};

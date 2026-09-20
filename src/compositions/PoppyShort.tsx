import React from "react";
import {AbsoluteFill, Sequence, useVideoConfig} from "remotion";
import type {ShortProps} from "../lib/schema";
import {buildBeatTimeline} from "../lib/timeline";
import {BeatScene} from "../components/BeatScene";

/**
 * Reusable vertical Short: smash-cut beats driven entirely by props.
 * Register a new composition in `src/Root.tsx` and pass a beat list.
 */
export const PoppyShort: React.FC<ShortProps> = ({beats, catalog}) => {
  const {fps} = useVideoConfig();
  const timeline = buildBeatTimeline(beats, fps);

  return (
    <AbsoluteFill style={{backgroundColor: "#05070a"}}>
      {timeline.map((beat) => (
        <Sequence
          key={beat.id}
          from={beat.startFrame}
          durationInFrames={beat.durationInFrames}
          name={beat.id}
        >
          <BeatScene beat={beat} fps={fps} catalog={catalog} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

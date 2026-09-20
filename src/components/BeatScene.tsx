import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import type {ContentCatalog} from "../lib/content-catalog";
import type {ScheduledBeat} from "../lib/timeline";
import {BeatMedia} from "./BeatMedia";
import {CaptionPop} from "./CaptionPop";
import {SmashFlash} from "./SmashFlash";
import {SfxLayer} from "./SfxLayer";

type BeatSceneProps = {
  readonly beat: ScheduledBeat;
  readonly fps: number;
  readonly catalog?: ContentCatalog;
};

/**
 * One smash-cut beat: plate, impact flash, caption pop, optional SFX slots.
 * A short camera shake sells the cut without extra media.
 */
export const BeatScene: React.FC<BeatSceneProps> = ({beat, fps, catalog}) => {
  const frame = useCurrentFrame();
  const shake = interpolate(frame, [0, 5], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = frame % 2 === 0 ? shake : -shake;

  return (
    <AbsoluteFill style={{translate: `${x}px 0px`, backgroundColor: "#05070a"}}>
      <BeatMedia source={beat.source} tone={beat.caption?.tone} catalog={catalog} />
      {beat.caption ? (
        <CaptionPop
          text={beat.caption.text}
          tone={beat.caption.tone}
          delaySeconds={beat.caption.delaySeconds}
        />
      ) : null}
      <SmashFlash />
      <SfxLayer cues={beat.sfx ?? []} fps={fps} />
    </AbsoluteFill>
  );
};

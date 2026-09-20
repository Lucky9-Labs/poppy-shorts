import React from "react";
import {AbsoluteFill, Img, OffthreadVideo} from "remotion";
import type {Beat, BeatSource} from "../lib/schema";
import {resolveMediaSrc} from "../lib/resolve-media";
import {PlaceholderPanel} from "./PlaceholderPanel";

type BeatMediaProps = {
  readonly source: BeatSource;
  readonly tone: NonNullable<Beat["caption"]>["tone"] | undefined;
};

/**
 * Renders the beat plate: generated placeholder, still, or video clip.
 * Local files resolve through `public/` (see `footage/` in the README).
 */
export const BeatMedia: React.FC<BeatMediaProps> = ({source, tone}) => {
  if (source.type === "placeholder") {
    return (
      <PlaceholderPanel
        color={source.color}
        label={source.label}
        tone={tone ?? "serious"}
      />
    );
  }

  if (source.type === "image") {
    return (
      <AbsoluteFill>
        <Img
          src={resolveMediaSrc(source.src)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={resolveMediaSrc(source.src)}
        volume={() => source.volume ?? 1}
        style={{width: "100%", height: "100%", objectFit: "cover"}}
      />
    </AbsoluteFill>
  );
};

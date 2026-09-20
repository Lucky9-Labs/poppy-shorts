import React from "react";
import {AbsoluteFill, Img, OffthreadVideo} from "remotion";
import type {ContentCatalog} from "../lib/content-catalog";
import {resolveBeatSource} from "../lib/resolve-catalog-source";
import type {Beat, BeatSource} from "../lib/schema";
import {resolveMediaSrc} from "../lib/resolve-media";
import {PlaceholderPanel} from "./PlaceholderPanel";

type BeatMediaProps = {
  readonly source: BeatSource;
  readonly tone: NonNullable<Beat["caption"]>["tone"] | undefined;
  readonly catalog?: ContentCatalog;
};

/**
 * Renders the beat plate: generated placeholder, still, or video clip.
 * Local files resolve through `public/` (see `footage/` in the README).
 */
export const BeatMedia: React.FC<BeatMediaProps> = ({source, tone, catalog}) => {
  const resolved = resolveBeatSource(source, catalog);

  if (resolved.type === "placeholder") {
    return (
      <PlaceholderPanel
        color={resolved.color}
        label={resolved.label}
        tone={tone ?? "serious"}
      />
    );
  }

  if (resolved.type === "image") {
    return (
      <AbsoluteFill>
        <Img
          src={resolveMediaSrc(resolved.src)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={resolveMediaSrc(resolved.src)}
        volume={() => resolved.volume ?? 1}
        style={{width: "100%", height: "100%", objectFit: "cover"}}
      />
    </AbsoluteFill>
  );
};

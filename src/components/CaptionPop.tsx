import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {goofyFontFamily, seriousFontFamily} from "../fonts";

type CaptionPopProps = {
  readonly text: string;
  readonly tone: "serious" | "goofy";
  readonly delaySeconds?: number;
};

/**
 * Slam-in caption: overshoot scale, then settle. Serious uses Anton;
 * goofy uses Bangers so juxtaposition reads even without voiceover.
 */
export const CaptionPop: React.FC<CaptionPopProps> = ({
  text,
  tone,
  delaySeconds = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = Math.round(delaySeconds * fps);
  const local = Math.max(0, frame - start);
  const scale = interpolate(local, [0, 7], [2.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const opacity = interpolate(local, [0, 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isGoofy = tone === "goofy";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div style={captionStyle(isGoofy, opacity, scale)}>{text}</div>
    </AbsoluteFill>
  );
};

/** Visual language for serious (Anton / white) vs goofy (Bangers / yellow). */
function captionStyle(isGoofy: boolean, opacity: number, scale: number) {
  return {
    opacity,
    scale,
    rotate: isGoofy ? "-3deg" : "0deg",
    color: isGoofy ? "#ffe14a" : "#f7f3ea",
    fontFamily: isGoofy ? goofyFontFamily : seriousFontFamily,
    fontSize: isGoofy ? 92 : 88,
    lineHeight: 1.05,
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
    WebkitTextStroke: isGoofy ? "0px transparent" : "3px #0b0f14",
    textShadow: isGoofy
      ? "0 8px 0 #1a0a24, 0 0 28px rgba(255,107,154,0.55)"
      : "0 10px 0 #000, 0 0 24px rgba(255,176,32,0.45)",
  };
}

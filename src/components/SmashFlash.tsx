import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

/**
 * Two-to-three frame white/amber flash on a smash cut.
 * Lives in beat-local time (Sequence), so frame 0 is the cut.
 */
export const SmashFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3], [0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fff4d6",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

import React from "react";
import {AbsoluteFill} from "remotion";

type PlaceholderPanelProps = {
  readonly color: string;
  readonly label?: string;
  readonly tone: "serious" | "goofy";
};

/**
 * Generated 9:16 plate used when no gameplay clip is attached.
 * Keeps the example Short renderable without private Hullscape assets.
 */
export const PlaceholderPanel: React.FC<PlaceholderPanelProps> = ({
  color,
  label,
  tone,
}) => {
  const stripe = tone === "serious" ? "rgba(255,176,32,0.18)" : "rgba(255,107,154,0.22)";

  return (
    <AbsoluteFill style={{backgroundColor: color, overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(
            -18deg,
            ${stripe} 0px,
            ${stripe} 18px,
            transparent 18px,
            transparent 46px
          )`,
        }}
      />
      {label ? (
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 80,
            color: "#f4f1ea",
            fontSize: 28,
            letterSpacing: 6,
            fontWeight: 700,
            opacity: 0.72,
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

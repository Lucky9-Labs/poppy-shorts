import type {ShortProps} from "../lib/schema";

/**
 * Hullscape channel example: serious mech-game energy cut against a goofy
 * process. Renders with generated color panels — no gameplay assets required.
 * Drop files into `sfx/whoosh` and `sfx/impact` to hear the audio slots.
 * `contentSources` is empty so this demo never requires AWS.
 */
export const exampleShortProps: ShortProps = {
  title: "Hullscape — mech vs process",
  contentSources: [],
  beats: [
    {
      id: "forge",
      durationInSeconds: 1.2,
      source: {
        type: "placeholder",
        color: "#0b0f14",
        label: "HANGER 04",
      },
      caption: {text: "WE FORGED A MECH", tone: "serious", delaySeconds: 0.06},
      sfx: [{src: "whoosh/cut-01.wav", atSeconds: 0, kind: "whoosh", volume: 0.85}],
    },
    {
      id: "group-chat",
      durationInSeconds: 1.5,
      source: {
        type: "placeholder",
        color: "#2a1840",
        label: "DEV LOG",
      },
      caption: {
        text: "in a group chat named OOPS",
        tone: "goofy",
        delaySeconds: 0.08,
      },
      sfx: [{src: "impact/hit-01.wav", atSeconds: 0.08, kind: "impact", volume: 0.9}],
    },
    {
      id: "boss",
      durationInSeconds: 1.1,
      source: {
        type: "placeholder",
        color: "#1a0c0c",
        label: "COMBAT",
      },
      caption: {text: "BOSS FIGHT ENERGY", tone: "serious", delaySeconds: 0.05},
      sfx: [{src: "whoosh/cut-01.wav", atSeconds: 0, kind: "whoosh", volume: 0.85}],
    },
    {
      id: "cube",
      durationInSeconds: 1.6,
      source: {
        type: "placeholder",
        color: "#14301c",
        label: "PLAYTEST",
      },
      caption: {
        text: "it's a cube with anxiety",
        tone: "goofy",
        delaySeconds: 0.1,
      },
      sfx: [
        {src: "impact/hit-01.wav", atSeconds: 0.1, kind: "impact", volume: 0.95},
        {src: "comedy/boing-01.wav", atSeconds: 0.35, kind: "comedy", volume: 0.7},
      ],
    },
    {
      id: "cta",
      durationInSeconds: 2.2,
      source: {
        type: "placeholder",
        color: "#101820",
        label: "@HULLSCAPE",
      },
      caption: {text: "HULLSCAPE", tone: "serious", delaySeconds: 0.05},
      sfx: [{src: "impact/hit-01.wav", atSeconds: 0.05, kind: "impact", volume: 1}],
    },
  ],
};

import {Composition, Folder} from "remotion";
import {PoppyShort} from "./compositions/PoppyShort";
import {calculateShortMetadata} from "./lib/calculate-short-metadata";
import {SHORTS_FPS, SHORTS_HEIGHT, SHORTS_WIDTH} from "./lib/constants";
import {ShortPropsSchema} from "./lib/schema";

/**
 * poppy-shorts compositions.
 * `PoppyShort` is the reusable pipeline. `ExampleShort` is the Hullscape demo
 * (smash cut + caption pop + whoosh/impact slots) and renders without media.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Pipeline">
        <Composition
          id="PoppyShort"
          component={PoppyShort}
          schema={ShortPropsSchema}
          calculateMetadata={calculateShortMetadata}
          fps={SHORTS_FPS}
          width={SHORTS_WIDTH}
          height={SHORTS_HEIGHT}
          durationInFrames={90}
          defaultProps={{
            title: "New Short",
            contentSources: [],
            beats: [
              {
                id: "hook",
                durationInSeconds: 1.2,
                source: {type: "placeholder", color: "#0b0f14", label: "HOOK"},
                caption: {text: "YOUR HOOK", tone: "serious", delaySeconds: 0.06},
                sfx: [{src: "whoosh/cut-01.wav", atSeconds: 0, kind: "whoosh"}],
              },
              {
                id: "turn",
                durationInSeconds: 1.8,
                source: {
                  type: "catalog",
                  kind: "video",
                  index: 0,
                  fallbackColor: "#2a1840",
                  fallbackLabel: "TURN",
                },
                caption: {text: "the goofy turn", tone: "goofy", delaySeconds: 0.08},
                sfx: [{src: "impact/hit-01.wav", atSeconds: 0.08, kind: "impact"}],
              },
            ],
          }}
        />
      </Folder>
      <Folder name="Examples">
        <Composition
          id="ExampleShort"
          component={PoppyShort}
          schema={ShortPropsSchema}
          calculateMetadata={calculateShortMetadata}
          fps={SHORTS_FPS}
          width={SHORTS_WIDTH}
          height={SHORTS_HEIGHT}
          durationInFrames={228}
          defaultProps={{
            title: "Hullscape — mech vs process",
            contentSources: [],
            beats: [
              {
                id: "forge",
                durationInSeconds: 1.2,
                source: {type: "placeholder", color: "#0b0f14", label: "HANGER 04"},
                caption: {text: "WE FORGED A MECH", tone: "serious", delaySeconds: 0.06},
                sfx: [{src: "whoosh/cut-01.wav", atSeconds: 0, kind: "whoosh", volume: 0.85}],
              },
              {
                id: "group-chat",
                durationInSeconds: 1.5,
                source: {type: "placeholder", color: "#2a1840", label: "DEV LOG"},
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
                source: {type: "placeholder", color: "#1a0c0c", label: "COMBAT"},
                caption: {text: "BOSS FIGHT ENERGY", tone: "serious", delaySeconds: 0.05},
                sfx: [{src: "whoosh/cut-01.wav", atSeconds: 0, kind: "whoosh", volume: 0.85}],
              },
              {
                id: "cube",
                durationInSeconds: 1.6,
                source: {type: "placeholder", color: "#14301c", label: "PLAYTEST"},
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
                source: {type: "placeholder", color: "#101820", label: "@HULLSCAPE"},
                caption: {text: "HULLSCAPE", tone: "serious", delaySeconds: 0.05},
                sfx: [{src: "impact/hit-01.wav", atSeconds: 0.05, kind: "impact", volume: 1}],
              },
            ],
          }}
        />
      </Folder>
    </>
  );
};

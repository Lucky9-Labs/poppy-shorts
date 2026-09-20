import {describe, expect, it} from "vitest";
import {calculateShortMetadata} from "./calculate-short-metadata";
import {SHORTS_FPS, SHORTS_HEIGHT, SHORTS_WIDTH} from "./constants";
import {exampleShortProps} from "../shorts/example-short";

describe("calculateShortMetadata", () => {
  it("locks 1080×1920 at 30fps and slugs the output name", async () => {
    const result = await calculateShortMetadata({
      defaultProps: exampleShortProps,
      props: exampleShortProps,
      abortSignal: new AbortController().signal,
      compositionId: "ExampleShort",
      isRendering: false,
    });

    expect(result.width).toBe(SHORTS_WIDTH);
    expect(result.height).toBe(SHORTS_HEIGHT);
    expect(result.fps).toBe(SHORTS_FPS);
    expect(result.defaultOutName).toBe("hullscape-mech-vs-process");
    expect(result.durationInFrames).toBeGreaterThan(SHORTS_FPS * 4);
  });
});

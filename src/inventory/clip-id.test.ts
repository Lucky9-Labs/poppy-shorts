import {describe, expect, it} from "vitest";
import {clipIdFromUri} from "./clip-id";

describe("clipIdFromUri", () => {
  it("is stable for the same s3 object", () => {
    const a = clipIdFromUri("s3://lucky9-clips/gameplay/boss.mp4");
    const b = clipIdFromUri("s3://lucky9-clips/gameplay/boss.mp4");
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(4);
  });

  it("differs across keys so tags never collide", () => {
    expect(clipIdFromUri("s3://lucky9-clips/gameplay/boss.mp4")).not.toBe(
      clipIdFromUri("s3://lucky9-clips/wip/desk.jpg"),
    );
  });
});

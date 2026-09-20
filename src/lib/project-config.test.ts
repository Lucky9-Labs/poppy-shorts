import {mkdtemp, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {describe, expect, it} from "vitest";
import {loadProjectConfig, resolveContentSources} from "./project-config";

describe("project config", () => {
  it("loads consumer-owned connection settings", async () => {
    const cwd = await mkdtemp(path.join(os.tmpdir(), "poppy-config-"));
    await writeFile(
      path.join(cwd, ".poppy-config.json"),
      JSON.stringify({channel: "Other Show", contentSources: ["s3://clips/raw"]}),
    );

    const config = await loadProjectConfig(cwd, {POPPY_CONFIG: ".poppy-config.json"});
    expect(config.channel).toBe("Other Show");
    expect(resolveContentSources(config, {})).toEqual(["s3://clips/raw/"]);
  });

  it("lets environment values override project defaults", () => {
    expect(
      resolveContentSources(
        {contentSources: ["s3://config/default"]},
        {CONTENT_SOURCES: "s3://env/override"},
      ),
    ).toEqual(["s3://env/override/"]);
  });
});

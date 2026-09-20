/**
 * Dry-run the storytelling pipeline.
 *
 *   npm run story
 *   npm run story -- --title "Weekly story" --narration "We shipped a feature."
 *
 * Without AWS / Fish credentials this writes an offline Short plan
 * (placeholders, no VO file). Never pass API keys as flags.
 */

import {writeFile} from "node:fs/promises";
import path from "node:path";
import {loadInventory} from "../inventory/persist";
import {resolveContentSources, loadProjectConfig} from "../lib/project-config";
import {parseStoryConfig, storyConfigFromEnv} from "../story/config";
import {runStoryPipeline} from "../story/pipeline";

const OUTPUT = path.join(process.cwd(), "public", "story-short.json");

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const projectConfig = await loadProjectConfig();
  const envVoice = storyConfigFromEnv();
  const config = parseStoryConfig({
    title: flags.title ?? `${projectConfig.channel ?? "Project"} offline story`,
    channel: flags.channel ?? projectConfig.channel,
    contentSources: flags.sources.length > 0 ? flags.sources : resolveContentSources(projectConfig),
    narration:
      flags.narration ??
      "We forged a mech. In a group chat named oops. Boss fight energy.",
    voice: envVoice.voice,
    transcribe: envVoice.transcribe,
  });

  const result = await runStoryPipeline({
    config,
    inventory: await loadInventory(),
  });
  await writeFile(OUTPUT, `${JSON.stringify(result.short, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${result.short.beats.length} beats to ${OUTPUT}` +
      ` (ingest skipped=${result.skipped.ingest}, VO skipped=${result.skipped.voiceover})`,
  );
}

function parseFlags(argv: string[]): {
  title?: string;
  channel?: string;
  narration?: string;
  sources: string[];
} {
  const sources: string[] = [];
  let title: string | undefined;
  let channel: string | undefined;
  let narration: string | undefined;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--title" && next) {
      title = next;
      i += 1;
    } else if (arg === "--channel" && next) {
      channel = next;
      i += 1;
    } else if (arg === "--narration" && next) {
      narration = next;
      i += 1;
    } else if (arg?.startsWith("s3://")) {
      sources.push(arg);
    }
  }
  return {title, channel, narration, sources};
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {z} from "zod";
import {parseContentSourcesInput} from "./content-sources";

/** Project-owned connection and channel settings discovered by the package. */
const ProjectConfigSchema = z.object({
  channel: z.string().min(1).optional(),
  contentSources: z.array(z.string()).optional(),
  awsRegion: z.string().min(1).optional(),
  localContentDir: z.string().min(1).default("content"),
  journeyDir: z.string().min(1).default("journeys"),
});

// Input stays permissive so callers can provide only the settings they own;
// parsed configs receive the local defaults from the schema.
export type ProjectConfig = z.input<typeof ProjectConfigSchema>;

export type ProjectSetup = {
  root: string;
  configPath: string;
  config: ProjectConfig;
  created: string[];
};

/**
 * Make a consumer repo usable without requiring prior Poppy knowledge.
 * This never invents a cloud destination: callers must provide one explicitly.
 */
export async function initializeProject(
  cwd = process.cwd(),
  options: Pick<ProjectConfig, "channel" | "awsRegion" | "contentSources"> = {},
): Promise<ProjectSetup> {
  const root = path.resolve(cwd);
  const configPath = path.join(root, ".poppy", "config.json");
  const existing = await loadProjectConfig(root);
  const config: ProjectConfig = {
    ...existing,
    ...options,
    localContentDir: existing.localContentDir ?? "content",
    journeyDir: existing.journeyDir ?? "journeys",
  };
  const created: string[] = [];
  for (const relative of [
    ".poppy",
    config.localContentDir ?? "content",
    config.journeyDir ?? "journeys",
    "inventory",
  ]) {
    const directory = path.resolve(root, relative);
    await mkdir(directory, {recursive: true});
    created.push(path.relative(root, directory) || ".");
  }
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, {flag: "w"});
  return {root, configPath, config, created};
}

/**
 * Read the consumer project's optional config. The package stays useful when
 * no config exists, while consumers avoid wiring every CLI independently.
 */
export async function loadProjectConfig(
  cwd = process.cwd(),
  env: Record<string, string | undefined> = process.env,
): Promise<ProjectConfig> {
  const configuredPath = env.POPPY_CONFIG?.trim();
  const candidates = configuredPath
    ? [path.resolve(cwd, configuredPath)]
    : [path.join(cwd, ".poppy", "config.json"), path.join(cwd, "poppy.config.json")];

  for (const file of candidates) {
    try {
      const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
      return ProjectConfigSchema.parse(parsed);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      const detail = error instanceof Error ? `: ${error.message}` : "";
      throw new Error(`Invalid Poppy project config at ${file}${detail}`);
    }
  }
  return {};
}

/** Environment values are explicit overrides; config supplies project defaults. */
export function resolveContentSources(
  config: ProjectConfig,
  env: Record<string, string | undefined> = process.env,
): string[] {
  return parseContentSourcesInput(env.CONTENT_SOURCES ?? config.contentSources);
}

export function resolveAwsRegion(
  config: ProjectConfig,
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  return env.AWS_REGION?.trim() || config.awsRegion;
}

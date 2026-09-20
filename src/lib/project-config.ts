import {readFile} from "node:fs/promises";
import path from "node:path";
import {z} from "zod";
import {parseContentSourcesInput} from "./content-sources";

/** Project-owned connection and channel settings discovered by the package. */
const ProjectConfigSchema = z.object({
  channel: z.string().min(1).optional(),
  contentSources: z.array(z.string()).optional(),
  awsRegion: z.string().min(1).optional(),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

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

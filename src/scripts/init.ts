/** Initialize the current consumer project with safe local Poppy defaults. */
import {initializeProject} from "../lib/project-config";

async function main(): Promise<void> {
  const setup = await initializeProject();
  console.log(`Poppy initialized in ${setup.root}`);
  console.log(`Config: ${setup.configPath}`);
  console.log(`Created/ensured: ${setup.created.join(", ")}`);
  if (!setup.config.contentSources?.length) {
    console.log("No cloud content source configured; captures remain local until one is chosen.");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

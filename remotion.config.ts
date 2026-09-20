/**
 * Remotion CLI config for poppy-shorts.
 * Node APIs do not read this file — pass the same options there if you render in code.
 *
 * Docs: https://www.remotion.dev/docs/config
 */

import {Config} from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./src/index.ts");

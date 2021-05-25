#!/usr/bin/env node

import Spinner from "ora";
import { buildRendererApp } from "./build";
import { boot } from "./simctl";
import { ensureConfigPath } from "./utils/paths";

const version = "VERSION_BUILD_REPLACE";

const args = process.argv.slice(2);
const [command] = args;

const run = async () => {
  console.log(`react-sidekick CLI v${version}`);
  const spinner = Spinner("Starting...").start();

  switch (command) {
    case "build":
      spinner.text = "Building react sidekick native renderer";
      try {
        await ensureConfigPath();
        await buildRendererApp();
        spinner.succeed("Renderer built successfully.");
        process.exit(0);
      } catch (_) {
        spinner.fail(
          `Failed to build renderer. View logs at ./.react-sidekick/build-ios/xcbuild-log`
        );
        process.exit(1);
      }
    default:
      spinner.fail(`Unrecognized command: ${command}`);
      process.exit(1);
  }
};

run();

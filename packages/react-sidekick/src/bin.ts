#!/usr/bin/env node

require("ts-node").register({
  cwd: process.cwd(),
  typeCheck: false,
  // ignore: ["(?:^|/)node_modules(?!/react-native)"],
  compilerOptions: {
    jsx: "react",
  },
});

// @ts-ignore
global.__DEV__ = false;

import Spinner from "ora";
import { resolve } from "path";
import { buildRendererApp } from "./build";
import { boot } from "./simctl";
import { runSimpleSnapshot } from "./snapshot";
import { SnapshotDeclaration } from "./utils/declaration";
import { ensureConfigPath } from "./utils/paths";
import { resolveSnapshotDeclarations } from "./utils/resolver";

const version = "VERSION_BUILD_REPLACE";

const args = process.argv.slice(2);
const [command, commandArg1] = args;

const run = async () => {
  console.log(`react-sidekick CLI v${version}`);
  const spinner = Spinner("Starting...").start();

  process.on("unhandledRejection", (error) => {
    spinner.fail(
      // @ts-ignore lazy {} type for error
      `Failed with unhandled error: ${error} ${error?.stack ?? "(no stack)"}`
    );
    process.exit(1);
  });

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
    case "render":
      if (!commandArg1) {
        spinner.fail(
          "Please specify a glob path to snapshot declaration file(s)."
        );
        process.exit(1);
      }
      const paths = resolveSnapshotDeclarations(commandArg1);
      if (!paths || !paths.length) {
        spinner.fail("No declarations found for provided glob pattern.");
        process.exit(1);
      }
      spinner.info(`Found declarations: ${paths}`);

      spinner.start(`Booting simulator`);
      await boot();
      spinner.succeed("Simulator booted.");

      for (let path of paths) {
        const declarationRequirePath = resolve(process.cwd(), path);
        spinner.start(`Running snapshot for ${declarationRequirePath}`);
        const declarationJson = require(declarationRequirePath);
        spinner.info(
          `found declaration for ${declarationRequirePath}: ${JSON.stringify(
            declarationJson
          )}`
        );
        const declaration = new SnapshotDeclaration(declarationJson);
        const jsStrings = await declaration.renderEach();
        for (let jsString of jsStrings) {
          await runSimpleSnapshot({
            name: path,
            jsString,
            outputPath: `${path}.png`,
          });
          spinner.succeed(`Snapshot saved to ${path}.png`);
        }
      }
      process.exit(0);
    default:
      spinner.fail(`Unrecognized command: ${command}`);
      process.exit(1);
  }
};

run();

import { install, launch, terminate, screenshot } from "./simctl";
import { watchLogs } from "./log-consumer";
import { inject } from "./injector";
import { hostAppBundleIdentifier } from "./constants";
import { paths } from "./utils/paths";
import { Frame } from "./utils/stack-frame-parser";
import { prepScreenshotPath } from "./artifacts";

const { appBundlePath } = paths;

const wait = (interval = 100) =>
  new Promise((resolve) => setTimeout(resolve, interval));

const seconds = (nanoSeconds: number) =>
  Math.round((nanoSeconds / 1e9) * 10) / 10;

export const runSnapshot = async (
  jsString: string,
  callContext: Frame,
  name?: string
): Promise<any> => {
  let startTime = process.hrtime();
  if (name) {
    console.log(`running snapshot for "${name}"`);
  }
  await inject(jsString);
  await install(appBundlePath);
  await launch(hostAppBundleIdentifier);

  return watchLogs()
    .then(() => wait()) // required to wait out splash screen fade post-launch
    .then(async () => {
      const filePath = await prepScreenshotPath(callContext);
      return screenshot(filePath);
    })
    .then(() => terminate(hostAppBundleIdentifier))
    .then(() => {
      if (name) {
        const finishTime = process.hrtime(startTime);
        console.log(`finished snapshot in ${seconds(finishTime[1])}s.`);
      }
    })
    .catch((err: string | Error) => console.log("received error:", err));
};

interface SnapshotOptions {
  name: string;
  jsString: string;
  outputPath?: string;
}

export const runSimpleSnapshot = async ({
  name,
  jsString,
  outputPath,
}: SnapshotOptions) => {
  let startTime = process.hrtime();
  if (name) {
    console.log(`running snapshot for "${name}"`);
  }
  await inject(jsString);
  await install(appBundlePath);
  await launch(hostAppBundleIdentifier);

  return watchLogs()
    .then(() => wait()) // required to wait out splash screen fade post-launch
    .then(() => screenshot(outputPath || "./snapshot-render.png"))
    .then(() => terminate(hostAppBundleIdentifier))
    .then(() => {
      if (name) {
        const finishTime = process.hrtime(startTime);
        console.log(`finished snapshot in ${seconds(finishTime[1])}s.`);
      }
    })
    .catch((err: string | Error) => console.log("received error:", err));
};

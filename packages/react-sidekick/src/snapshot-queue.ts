import { install, launch, terminate, screenshot } from "./simctl";
import { watchLogs } from "./log-consumer";
import { inject } from "./injector";
import { hostAppBundleIdentifier } from "./constants";
import { paths } from "./utils/paths";
import { parseStackFrame, Frame } from "./utils/stack-frame-parser";
import { prepScreenshotPath } from "./artifacts";

const { appBundlePath } = paths;

let processed: Array<Frame | null | undefined>;
let queue: Promise<void>;

const initializeQueue = () => {
  processed = [];
  queue = Promise.resolve();
};

const wait = (interval = 100) =>
  new Promise((resolve) => setTimeout(resolve, interval));

const runSnapshot = async (
  jsString: string,
  callContext: Frame
): Promise<any> => {
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
    .catch((err: string | Error) => console.log("received error:", err));
};

const saveCallContext = (callContext: Frame) => {
  processed.push(callContext);
};

export const queueSnapshot = async (jsString: string, callContext: Frame) => {
  if (queue == null) initializeQueue();
  saveCallContext(callContext);
  queue = queue.then(() => runSnapshot(jsString, callContext));
};

export const waitForQueue = async () => {
  await queue;
  return processed;
};

export const reset = () => {
  queue = Promise.resolve();
  processed = [];
};

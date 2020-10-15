import { shutdown } from "./simctl";
import { queueSnapshot, waitForQueue } from "./snapshot-queue";
import { TeardownOptions, IPCMessage } from "./ipc";
import { Frame } from "./utils/stack-frame-parser";

export const snapshot = (js: string, callContext: Frame, name?: string) => {
  queueSnapshot(js, callContext, name);
};

const defaultTeardownOptions = {
  skipShutdown: false,
};

export const teardown = async ({ skipShutdown }: TeardownOptions) => {
  await waitForQueue();
  if (skipShutdown !== false) {
    await shutdown();
  }
};

export { waitForQueue };

process.on("message", (message: IPCMessage) => {
  if (typeof message !== "object") return;
  switch (message.method) {
    case "snapshot":
      snapshot(message.jsString, message.callContext);
      return;
    case "teardown":
      teardown(message.options || defaultTeardownOptions).then(() =>
        process.exit()
      );
      return;
    case "log":
      console.log(message);
      return;
  }
});

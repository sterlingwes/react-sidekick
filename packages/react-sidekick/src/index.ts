import { fork as forkNodeProcess } from "child_process";
import { transform } from "react-test-render-transformer";
import { ReactTestRendererTree } from "react-test-renderer";
import { IPCMessage, TeardownOptions } from "./ipc";
import { parseStackFrame } from "./utils/stack-frame-parser";

import { boot } from "./simctl";

export const setup = async () => {
  await boot();
};

const captureCallFrame = () => {
  const err = new Error();
  let snapshotContext;
  if (err.stack) {
    snapshotContext = parseStackFrame(err.stack);
  }

  return snapshotContext;
};

export const fork = () => {
  const childProcess = forkNodeProcess(
    `./node_modules/react-sidekick/dist/main.js`
  );

  const send = (
    message: IPCMessage,
    callback?: ((err: Error | null) => void) | undefined
  ) => childProcess.send(message, callback);

  return {
    snapshot: (testInstance: ReactTestRendererTree) => {
      const jsString = transform(testInstance);
      const callContext = captureCallFrame();
      if (callContext == null) {
        throw new Error(`Unable to capture call context, no snapshot taken`);
      }
      send({ method: "snapshot", jsString, callContext }, (err) =>
        err ? console.log("react-sidekick IPC send error", err) : null
      );
    },

    teardown: (options: TeardownOptions) => {
      send({ method: "teardown", options });
    },
  };
};

import { transform } from "react-test-render-transformer";
import TestRenderer from "react-test-renderer";
import { parseStackFrame } from "./utils/stack-frame-parser";
import { runSnapshot } from "./snapshot";

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

export const snapshot = async (element: JSX.Element) => {
  const testRenderer = TestRenderer.create(element);
  const tree = testRenderer.toJSON();

  if (!tree) {
    throw new Error(`Cannot snapshot ${element} which returned a "null" tree.`);
  }

  // @ts-ignore
  const jsString = transform(tree);
  const callContext = captureCallFrame();

  console.log({ jsString });

  if (callContext == null) {
    throw new Error(`Unable to capture call context, no snapshot taken`);
  }

  console.log("setting up environment...");
  await setup();
  console.log("running snapshot...");
  await runSnapshot(jsString, callContext);
  console.log("snapshot taken!");
};

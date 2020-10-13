import {
  transformToSimpleTree,
  RenderableNode,
} from "react-test-render-transformer";
import { ReactTestRendererTree } from "react-test-renderer";
import { SnapshotPluginSerialize, SnapshotPluginTest } from "./types";

const instanceOfTestRenderTree = (
  value: any
): value is ReactTestRendererTree => {
  return (
    typeof value === "object" &&
    "rendered" in value &&
    "type" in value &&
    "props" in value
  );
};

type Frame = {
  filePath: string;
  lineNumber: number;
  column: number;
};

const originalTraceLimit = Error.stackTraceLimit;

const resetTraceLimit = () => {
  Error.stackTraceLimit = originalTraceLimit;
};

const nodeModulesDir = "node_modules/";

const findProjectFrame = (stack: string[]): string | undefined =>
  stack.find((frame) => frame.includes(nodeModulesDir) === false);

const pwd: string = process.cwd().split(nodeModulesDir).shift() ?? "";

const getCallSite = (): Frame | null => {
  Error.stackTraceLimit = 30;
  const traceTarget: { stack?: string } = {};
  Error.captureStackTrace(traceTarget);
  resetTraceLimit();
  const { stack } = traceTarget;
  if (!stack) return null;
  const stackParts = stack.split("\n");
  stackParts.shift();
  const callerFrame = findProjectFrame(stackParts);
  if (!callerFrame) return null;
  const frameMatch = callerFrame.match(/([^\s\(\)]+):([0-9]+):([0-9]+)/);
  if (!frameMatch) return null;

  return {
    filePath: frameMatch[1].replace(pwd, ""),
    lineNumber: parseInt(frameMatch[2]),
    column: parseInt(frameMatch[3]),
  };
};

const formatSnapshot = (tree: RenderableNode[]): string => {
  return JSON.stringify(
    {
      meta: {
        source: "react-test-render-transformer",
        callSite: getCallSite(),
      },
      tree,
    },
    null,
    2
  );
};

export const serialize: SnapshotPluginSerialize = (value: any): string => {
  return formatSnapshot(transformToSimpleTree(value));
};

export const test: SnapshotPluginTest = (value: any) =>
  instanceOfTestRenderTree(value);

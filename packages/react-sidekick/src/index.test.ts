import React from "react";
import { snapshot } from "./index";
import { exec } from "./utils/exec";
import * as StackParser from "./utils/stack-frame-parser";

jest.mock("./utils/exec");
jest.mock("./utils/spawn");
jest.mock("./utils/paths");

jest.mock("replacestream", () => () => {});

jest.mock("fs", () => {
  const emitter = {
    on: (eventName: string, handler: () => {}) =>
      eventName === "finish" ? handler() : null,
  };

  const pipeable = {
    pipe: () => pipeable,
    ...emitter,
  };

  const createMockPipe = () => ({
    ...pipeable,
    ...emitter,
  });

  return {
    createReadStream: createMockPipe,
    createWriteStream: jest.fn(),
  };
});

const artifactPath =
  "/Users/you/someproject/__artifacts__/some-path-index-test-ts";

const execCalls = {
  startSimulator: ["xcrun simctl bootstatus 'iPod touch (7th generation)' -b"],
  resetAppJsBundle: [
    "cp /Users/you/someproject/node_modules/@react-sidekick/native-host/rnfastview.app/main.jsbundlebackup /Users/you/someproject/node_modules/@react-sidekick/native-host/rnfastview.app/main.jsbundle",
  ],
  moveTmpInjectedJsBundle: [
    "mv /Users/you/someproject/node_modules/@react-sidekick/native-host/rnfastview.app/main.jsbundle.tmp /Users/you/someproject/node_modules/@react-sidekick/native-host/rnfastview.app/main.jsbundle",
  ],
  installInjectedAppBundle: [
    "xcrun simctl install booted /Users/you/someproject/node_modules/@react-sidekick/native-host/rnfastview.app",
  ],
  launchApp: [
    "xcrun simctl launch booted org.reactjs.native.example.rnfastview",
  ],
  takeScreenshot: [
    `xcrun simctl io booted screenshot --type png ${artifactPath}/1-2-ios.png`,
  ],
  takeScreenshotTwo: [
    `xcrun simctl io booted screenshot --type png ${artifactPath}/2-2-ios.png`,
  ],
  stopApp: [
    "xcrun simctl terminate booted org.reactjs.native.example.rnfastview",
  ],
  prepArtifactDirectory: [`mkdir -p ${artifactPath}`],
};

const simpleJsString =
  'g.react.createElement(g.react.Fragment, null, g.react.createElement(g.rn.View, {\\"style\\":{\\"flex\\":1,\\"backgroundColor\\":\\"red\\"}}, undefined))';

const assertCallOrder = (
  expectedCalls: Array<keyof typeof execCalls>,
  mockFn: jest.Mock
) => {
  expectedCalls.forEach((callName, index) => {
    const expectedCall = execCalls[callName];
    expect(mockFn.mock.calls[index]).toEqual(expectedCall);
  });
  expect(mockFn.mock.calls.length).toEqual(expectedCalls.length);
};

describe("react-sidekick snapshot()", () => {
  beforeAll(() => {
    // @ts-expect-error mocked method
    exec.mockImplementation((command) => {
      if (execCalls.startSimulator[0] === command) {
        return "Finished";
      }

      return "";
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockFrame = {
    filePath: "/Users/you/someproject/some/path/index.test.ts",
    lineNumber: 1,
    column: 2,
  };

  beforeEach(() => {
    // mock stack parser once for each snapshot call for this block to keep absolute
    // paths non-specific to local environments
    jest.spyOn(StackParser, "parseStackFrame").mockReturnValueOnce(mockFrame);
    jest
      .spyOn(StackParser, "parseStackFrame")
      .mockReturnValueOnce({ ...mockFrame, lineNumber: 2 });
  });

  describe("snapshot", () => {
    it("should make the expected invocations", async () => {
      const element = React.createElement(
        React.Fragment,
        null,
        React.createElement("View", {
          style: { flex: 1, backgroundColor: "red" },
        })
      );
      await snapshot(element);
      assertCallOrder(
        [
          // first snapshot
          "startSimulator",
          "resetAppJsBundle",
          "moveTmpInjectedJsBundle",
          "installInjectedAppBundle",
          "launchApp",
          "prepArtifactDirectory",
          "takeScreenshot",
          "stopApp",
        ],
        exec as jest.Mock
      );
    });
  });
});

import { parseStackFrame } from "./stack-frame-parser";

const exampleFrame = `Error
at captureCallFrame (/Users/you/Code/someproject/node_modules/react-sidekick/dist/index.js:12:17)
at snapshot (/Users/you/Code/someproject/node_modules/react-sidekick/dist/index.js:38:33)
at snapshot (/Users/you/Code/someproject/some/folder/with.test.js:47:9)
at tryCatch (/Users/you/Code/someproject/node_modules/regenerator-runtime/runtime.js:45:40)
at Generator.invoke [as _invoke] (/Users/you/Code/someproject/node_modules/regenerator-runtime/runtime.js:274:22)
at Generator.prototype.<computed> [as next] (/Users/you/Code/someproject/node_modules/regenerator-runtime/runtime.js:97:21)
at tryCatch (/Users/you/Code/someproject/node_modules/regenerator-runtime/runtime.js:45:40)
at invoke (/Users/you/Code/someproject/node_modules/regenerator-runtime/runtime.js:135:20)
at /Users/you/Code/someproject/node_modules/regenerator-runtime/runtime.js:170:11
at tryCallTwo (/Users/you/Code/someproject/node_modules/promise/lib/core.js:45:5)`;

describe("stack frame parser", () => {
  it("should parse out the line number and file name of the snapshot call", () => {
    const parsed = parseStackFrame(exampleFrame);
    expect(parsed).toEqual(
      expect.objectContaining({
        filePath: "/Users/you/Code/someproject/some/folder/with.test.js",
        lineNumber: 47,
        column: 9,
      })
    );
  });
});

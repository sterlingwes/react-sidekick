import { getScreenshotFilePath } from "./artifacts";

describe("artifacts", () => {
  describe("getScreenshotFilePath", () => {
    it("should return artifact location", () => {
      jest.spyOn(process, "cwd").mockReturnValue("/Users/you/someproject");

      expect(
        getScreenshotFilePath({
          filePath: "/Users/you/someproject/some/folder/some.test.js",
          lineNumber: 100,
          column: 2,
        })
      ).toEqual({
        folder: "some-folder-some-test-js",
        filename: "100-2-ios.png",
      });
    });
  });
});

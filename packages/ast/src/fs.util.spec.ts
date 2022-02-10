import fs from "fs";
import { findPath } from "./fs.util";

describe("fs utils", () => {
  describe("findPath", () => {
    describe("with tsx extension match", () => {
      beforeEach(() => {
        jest.spyOn(fs, "accessSync").mockImplementation((path) => {
          if (path.toString().endsWith(".tsx")) {
            return undefined;
          }

          throw new Error("No file");
        });
      });

      it("should return that path", () => {
        const path = findPath("/my/path/components/MyComponent");
        expect(path).toEqual("/my/path/components/MyComponent.tsx");
      });
    });

    describe("with index file match", () => {
      beforeEach(() => {
        jest.spyOn(fs, "accessSync").mockImplementation((path) => {
          if (path.toString().endsWith("/index.ts")) {
            return undefined;
          }

          throw new Error("No file");
        });
      });

      it("should return that path", () => {
        const path = findPath("/my/path/components");
        expect(path).toEqual("/my/path/components/index.ts");
      });
    });
  });
});

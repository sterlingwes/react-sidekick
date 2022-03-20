import fs from "fs";
import { findPath } from "./fs.util";

describe("fs utils", () => {
  describe("findPath", () => {
    describe("with tsx extension match", () => {
      beforeEach(() => {
        jest.spyOn(fs, "access").mockImplementation((path, callback) => {
          if (path.toString().endsWith(".tsx")) {
            callback(null);
            return;
          }

          callback(new Error("No file"));
        });
      });

      it("should return that path", async () => {
        const path = await findPath("/my/path/components/MyComponent");
        expect(path).toEqual("/my/path/components/MyComponent.tsx");
      });
    });

    describe("with index file match", () => {
      beforeEach(() => {
        jest.spyOn(fs, "access").mockImplementation((path, callback) => {
          if (path.toString().endsWith("/index.ts")) {
            callback(null);
            return;
          }

          callback(new Error("No file"));
        });
      });

      it("should return that path", async () => {
        const path = await findPath("/my/path/components");
        expect(path).toEqual("/my/path/components/index.ts");
      });
    });
  });
});

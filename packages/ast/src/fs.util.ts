import fs from "fs";
import { CrawlPaths } from "./types";

export const interestingCrawlPaths = (
  crawlPaths: CrawlPaths,
  componentIdentifiers: Set<string>
) => {
  return Object.keys(crawlPaths).filter((path) => {
    if (/\./.test(path) === false) {
      // skip non-relative paths
      return false;
    }

    const bindings = crawlPaths[path];
    return bindings.some((binding) => componentIdentifiers.has(binding));
  });
};

const hasExtension = (filePath: string) => /\.[a-z0-9A-Z]{2,3}/.test(filePath);
const extensions = [".ts", ".tsx", "/index.ts", "/index.tsx"];

export const findPath = (filePath: string) => {
  if (hasExtension(filePath)) {
    return filePath;
  }

  const extMatch = extensions.find((ext) => {
    const testPath = `${filePath}${ext}`;
    try {
      return fs.accessSync(testPath) === undefined;
    } catch (e) {
      return false;
    }
  });

  if (extMatch) {
    return `${filePath}${extMatch}`;
  }

  return null;
};

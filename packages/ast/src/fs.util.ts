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

const fileExists = (path: string) => {
  return new Promise((resolve) => {
    fs.access(path, (err) => (err ? resolve(false) : resolve(true)));
  });
};

const asyncFindExtensionMatch = (extensions: string[], filePath: string) => {
  return extensions.reduce((chain, ext) => {
    return chain.then((match) => {
      if (match) return match;
      const testPath = `${filePath}${ext}`;
      return fileExists(testPath).then((exists) =>
        exists ? testPath : undefined
      );
    });
  }, Promise.resolve() as Promise<undefined | string>);
};

export const findPath = async (filePath: string) => {
  if (hasExtension(filePath)) {
    return filePath;
  }

  return asyncFindExtensionMatch(extensions, filePath);
};

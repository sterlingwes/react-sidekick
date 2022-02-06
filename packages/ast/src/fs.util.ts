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

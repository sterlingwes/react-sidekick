import path from "path";
import { ImportDeclaration, ImportSpecifier, Node } from "typescript";
import { CrawlPaths } from "./types";

export const handleImportDeclaration = (
  importNode: ImportDeclaration,
  crawlPaths: Record<string, string[]>
) => {
  let bindings: any[] = [];
  importNode.importClause?.namedBindings?.forEachChild((binding) => {
    bindings.push(binding);
  });

  const singleImport = importNode.importClause;
  if (bindings.length === 0 && singleImport) {
    bindings.push(singleImport);
  }

  const modulePath = (importNode.moduleSpecifier as any).text;
  const moduleBindings = bindings.map(
    (binding: ImportSpecifier) => binding.name.escapedText as string
  );

  if (crawlPaths[modulePath]) {
    crawlPaths[modulePath] = crawlPaths[modulePath].concat(...moduleBindings);
  } else {
    crawlPaths[modulePath] = moduleBindings;
  }
};

export const interestingCrawlPaths = (
  crawlPaths: CrawlPaths,
  componentIdentifiers: Set<string>,
  baseFilePath: string
) => {
  const baseFilePathParts = baseFilePath.split("/");
  baseFilePathParts.pop();

  const basePath = baseFilePathParts.join("/");

  return Object.keys(crawlPaths)
    .filter((crawlPath) => {
      if (/\./.test(crawlPath) === false) {
        // skip non-relative paths
        return false;
      }

      const bindings = crawlPaths[crawlPath];
      return bindings.some((binding) => componentIdentifiers.has(binding));
    })
    .map((crawlPath) => path.resolve(basePath, crawlPath));
};

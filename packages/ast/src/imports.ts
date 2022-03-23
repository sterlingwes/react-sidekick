import path from "path";
import {
  ImportDeclaration,
  isImportClause,
  isImportSpecifier,
  Node,
} from "typescript";
import { CrawlPaths, ImportBinding } from "./types";

const toBindingNames = (binding: Node) => {
  let alias;
  let name =
    isImportClause(binding) || isImportSpecifier(binding)
      ? (binding.name?.escapedText as string | undefined)
      : undefined;
  if (isImportSpecifier(binding) && binding.propertyName) {
    alias = name;
    name = binding.propertyName.escapedText as string | undefined;
  }

  return { name, alias };
};

const validNames = (names: {
  name: string | undefined;
  alias: string | undefined;
}): names is ImportBinding => typeof names.name === "string";

export const handleImportDeclaration = (
  importNode: ImportDeclaration,
  crawlPaths: CrawlPaths
) => {
  const modulePath = (importNode.moduleSpecifier as any).text;

  let bindings: ImportBinding[] = [];

  importNode.importClause?.namedBindings?.forEachChild((binding) => {
    const names = toBindingNames(binding);
    if (validNames(names)) bindings.push(names);
  });

  const singleImport = importNode.importClause;
  if (singleImport && singleImport.name) {
    bindings.push({
      name: "default",
      alias: singleImport.name.escapedText as string | undefined,
    });
  }

  if (crawlPaths[modulePath]) {
    crawlPaths[modulePath] = crawlPaths[modulePath].concat(...bindings);
  } else {
    crawlPaths[modulePath] = bindings;
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
      return bindings.some((binding) =>
        componentIdentifiers.has(binding.alias ?? binding.name)
      );
    })
    .map((crawlPath) => path.resolve(basePath, crawlPath));
};

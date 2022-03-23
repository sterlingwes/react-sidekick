import path from "path";
import {
  ImportClause,
  ImportDeclaration,
  ImportSpecifier,
  isImportSpecifier,
} from "typescript";
import { CrawlPaths, ImportBinding } from "./types";

type ImportNameBinding = ImportSpecifier | ImportClause;

export const handleImportDeclaration = (
  importNode: ImportDeclaration,
  crawlPaths: CrawlPaths,
  aliases: Record<string, string> // Key as Value (Source as Alias)
) => {
  let bindings: ImportNameBinding[] = [];

  importNode.importClause?.namedBindings?.forEachChild((binding) => {
    bindings.push(binding as ImportSpecifier);
  });

  const singleImport = importNode.importClause;
  if (bindings.length === 0 && singleImport) {
    bindings.push(singleImport);
  }

  const modulePath = (importNode.moduleSpecifier as any).text;
  const moduleBindings = bindings
    .map((binding: ImportNameBinding) => {
      let alias;
      let name = binding.name?.escapedText as string | undefined;
      if (isImportSpecifier(binding) && binding.propertyName) {
        alias = name;
        name = binding.propertyName.escapedText as string | undefined;
      }

      return { name, alias };
    })
    .filter((binding): binding is ImportBinding => !!binding.name);

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
      return bindings.some((binding) =>
        componentIdentifiers.has(binding.alias ?? binding.name)
      );
    })
    .map((crawlPath) => path.resolve(basePath, crawlPath));
};

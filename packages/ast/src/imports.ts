import path from "path";
import {
  ImportDeclaration,
  isImportClause,
  isImportSpecifier,
  isCallExpression,
  isIdentifier,
  isVariableDeclaration,
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

const nonSrcFileExtension = (crawlPath: string) => /\.svg$/.test(crawlPath);

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

      if (nonSrcFileExtension(crawlPath)) {
        return false;
      }

      const bindings = crawlPaths[crawlPath];
      return bindings.some((binding) =>
        componentIdentifiers.has(binding.alias ?? binding.name)
      );
    })
    .map((crawlPath) => path.resolve(basePath, crawlPath));
};

export const findMatchingNpmModule = (
  crawlPaths: CrawlPaths,
  elementName: string
) => {
  return Object.entries(crawlPaths).find(([modulePath, importBindings]) => {
    if (modulePath.charAt(0) === ".") {
      // only apply for third-party components for now
      return false;
    }

    return !!importBindings.find(({ name, alias }) => {
      const match = alias ?? name;
      return elementName === match;
    });
  });
};

export const trackIndirectImportBinding = (
  childNode: Node,
  crawlPaths: CrawlPaths
) => {
  if (
    isVariableDeclaration(childNode) &&
    isIdentifier(childNode.name) &&
    childNode.initializer &&
    isCallExpression(childNode.initializer) &&
    isIdentifier(childNode.initializer.expression)
  ) {
    const possibleImportBinding = childNode.initializer.expression
      .escapedText as string;
    const match = findMatchingNpmModule(crawlPaths, possibleImportBinding);
    if (match && match[0].charAt(0) !== ".") {
      match[1].push({
        name: childNode.name.escapedText as string,
        alias: undefined,
      });
    }
  }
};

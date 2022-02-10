import path from "path";
import ts, {
  ImportDeclaration,
  ImportSpecifier,
  JsxEmit,
  Node,
  Path,
  Program,
  SourceFile,
  SyntaxKind,
} from "typescript";
import { log } from "./debug.util";
import { findPath, interestingCrawlPaths } from "./fs.util";
import {
  createNode,
  encodeId,
  ignored,
  interesting,
  jsxTag,
  jsxTagName,
  nodeName,
  possibleComponentExport,
  target,
} from "./node.util";
import {
  AstState,
  ComponentName,
  CrawlPaths,
  Id,
  NodeLookups,
  NodeTree,
  Plugin,
} from "./types";

interface TraverseInput {
  node: Node | SourceFile;
  tree: NodeTree;
  lookups: NodeLookups;
  path: number[];
  crawlPaths: CrawlPaths;
  names: Set<string>;
  plugins: Plugin[];
}

interface SaveInputs {
  name: ComponentName;
  path: number[];
  tree: NodeTree;
  lookups: NodeLookups;
  names: Set<string>;
}

const saveElement = ({ name, path, tree, lookups, names }: SaveInputs) => {
  names.add(name);
  const id = encodeId(name, path);
  const newNode = createNode(id);
  lookups.elements[id] = { name };
  tree.children.push(newNode);
  lookups.leafNodes.add(id);
  lookups.leafNodes.delete(tree.id);
  return newNode;
};

const skippedNodes = new Set<SyntaxKind>();

let lastIdentifier: string | undefined;
let currentNodeKind: SyntaxKind | undefined;
let lastNodeKind: SyntaxKind | undefined;

const traverse = (options: TraverseInput) => {
  const { node, tree, lookups, path, crawlPaths, names, plugins } = options;

  node.forEachChild((childNode) => {
    lastNodeKind = currentNodeKind;
    currentNodeKind = childNode.kind;

    if (ignored(childNode)) {
      log(`Ignored node of type ${SyntaxKind[childNode.kind]}`);
      return;
    }

    // save name of likely component export
    if (possibleComponentExport(childNode.kind, lastNodeKind ?? 0)) {
      lastIdentifier = nodeName(childNode);
      log({
        lastIdentifier,
        lastNodeKind: SyntaxKind[lastNodeKind ?? 0],
      });
    }

    if ([SyntaxKind.ImportDeclaration].includes(childNode.kind)) {
      const importNode = childNode as ImportDeclaration;
      let bindings: any[] = [];
      importNode.importClause?.namedBindings?.forEachChild((binding) => {
        bindings.push(binding);
      });

      if (bindings.length === 0) {
        const singleImport = importNode.importClause;
        bindings.push(singleImport);
      }

      const modulePath = (importNode.moduleSpecifier as any).text;
      const moduleBindings = bindings.map(
        (binding: ImportSpecifier) => binding.name.escapedText as string
      );

      if (crawlPaths[modulePath]) {
        crawlPaths[modulePath] = crawlPaths[modulePath].concat(
          ...moduleBindings
        );
      } else {
        crawlPaths[modulePath] = moduleBindings;
      }

      return; // handled current node as import type
    }

    if (target(childNode)) {
      let parentNode = tree;

      if (lastIdentifier) {
        path.push(0);
        parentNode = saveElement({
          name: lastIdentifier,
          path,
          tree,
          lookups,
          names,
        });
        lastIdentifier = undefined;
      }

      const newPath = [...path, parentNode.children.length];
      const element = jsxTag(childNode);
      const name = jsxTagName(element);

      // TODO: need better way to match known lib components
      // need to check name export and normalize for renames / aliasing
      const plugin = plugins.find(({ componentIds }) =>
        componentIds.includes(name)
      );

      if (plugin) {
        plugin.visitComponent({
          name,
          element,
          tree: parentNode,
          lookups,
          names,
        });
      }

      const newTree = saveElement({
        name,
        path: newPath,
        lookups,
        names,
        tree: parentNode,
      });

      traverse({
        node: childNode,
        tree: newTree,
        lookups,
        path: newPath,
        crawlPaths,
        names,
        plugins,
      });
    } else if (interesting(childNode)) {
      traverse({
        node: childNode,
        tree,
        lookups,
        path,
        crawlPaths,
        names,
        plugins,
      });
      // } else if (childNode.kind === SyntaxKind.JsxExpression) {
      //   log({ childNode });
    } else {
      skippedNodes.add(childNode.kind);
    }
  });
};

interface SharedOptions {
  plugins?: Plugin[];
}

interface TraverseOptions extends SharedOptions {
  dirname?: string;
  projectFiles: string[];
  program: Program;
}

export const buildProgram = (projectRootPath: string) =>
  ts.createProgram([projectRootPath], {
    noEmitOnError: true,
    noImplicitAny: false,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    jsx: JsxEmit.React,
  });

export const traverseProject = (
  projectRootPath: string,
  options: SharedOptions
) => {
  const dirname = path.dirname(projectRootPath);
  const program = buildProgram(projectRootPath);

  const projectFiles: string[] = program
    .getSourceFiles()
    // @ts-ignore
    .map((file) => file.path)
    .filter((filePath) => /node_modules/.test(filePath) === false);

  log({ projectFiles });

  const sourceFile = program.getSourceFile(projectRootPath);

  if (!sourceFile) {
    throw new Error(
      `No SourceFile to traverse, is ${projectRootPath} a valid path?`
    );
  }

  return traverseFromFile(sourceFile, {
    ...options,
    dirname,
    projectFiles,
    program,
  });
};

export const traverseFromFile = (
  sourceFile: SourceFile,
  options: TraverseOptions
): AstState => {
  const { projectFiles, dirname, program } = options;

  // lookups that persist across full system traversal
  const tree = createNode("_root");
  const lookups: NodeLookups = {
    files: {},
    leafNodes: new Set<Id>(),
    elements: {},
    thirdParty: {},
  };

  // lookups relevant for this file
  const names = new Set<string>();
  const crawlPaths = {};

  traverse({
    node: sourceFile,
    tree,
    lookups,
    path: [],
    crawlPaths,
    names,
    plugins: options.plugins ?? [],
  });

  const followableCrawlPaths = interestingCrawlPaths(crawlPaths, names);
  log({ followableCrawlPaths });

  if (dirname && followableCrawlPaths.length) {
    followableCrawlPaths.forEach((filePath) => {
      const subPath = findPath(path.resolve(dirname, filePath));
      if (!subPath) {
        throw new Error(
          `Exhausted possibilities resolving path to ${filePath} from ${dirname}`
        );
      }

      const subSource = program.getSourceFile(subPath);
      if (!subSource) {
        throw new Error(`Failed to traverse to ${subPath}`);
      }

      const result = traverseFromFile(subSource, options);
      log({ result });
    });
  }

  log({
    skippedNodes: Array.from(skippedNodes).map((kind) => SyntaxKind[kind]),
  });

  return {
    ...lookups,
    hierarchy: tree,
  };
};

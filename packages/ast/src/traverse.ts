import ts, {
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  Node,
  SourceFile,
  SyntaxKind,
} from "typescript";
import { log } from "./debug.util";
import { interestingCrawlPaths } from "./fs.util";
import {
  createNode,
  encodeId,
  ignored,
  interesting,
  jsxProps,
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
  const parentNode = createNode(id);
  lookups.elements[id] = { name };
  tree.children.push(parentNode);
  return parentNode;
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

interface TraverseOptions {
  plugins: Plugin[];
}

export const traverseFromFile = (
  filePath: string,
  options: TraverseOptions
): AstState => {
  const program = ts.createProgram([filePath], {
    noEmitOnError: true,
    noImplicitAny: false,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });

  const sourceFile = program.getSourceFile(filePath);

  if (!sourceFile) {
    throw new Error(`No SourceFile to traverse, is ${filePath} a valid path?`);
  }

  // lookups that persist across full system traversal
  const tree = createNode("_root");
  const lookups = {
    files: {},
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
    plugins: options.plugins,
  });

  const followableCrawlPaths = interestingCrawlPaths(crawlPaths, names);
  log({ followableCrawlPaths });

  log({
    skippedNodes: Array.from(skippedNodes).map((kind) => SyntaxKind[kind]),
  });

  return {
    ...lookups,
    hierarchy: tree,
  };
};

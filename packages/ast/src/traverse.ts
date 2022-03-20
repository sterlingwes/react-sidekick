import path from "path";
import {
  ImportDeclaration,
  ImportSpecifier,
  Node,
  SourceFile,
  SyntaxKind,
} from "typescript";
import { log } from "./debug.util";
import {
  DiagnosticReason,
  DiagnosticTree,
  trackDeadEndDiagnostic,
  trackDiagnostic,
  trackDiagnosticFileBoundary,
} from "./diagnostic.util";
import { findPath, interestingCrawlPaths } from "./fs.util";
import {
  createNode,
  getLeafNode,
  ignored,
  interesting,
  jsxTag,
  jsxTagName,
  nodeName,
  possibleComponentExport,
  saveChildElement,
  saveElement,
  target,
} from "./node.util";
import { buildProgram } from "./program";
import {
  AstState,
  CrawlPaths,
  Id,
  NodeLookups,
  NodeTree,
  Plugin,
  SharedOptions,
  TraverseOptions,
} from "./types";

interface TraverseInput {
  node: Node | SourceFile;
  tree: NodeTree;
  lookups: NodeLookups;
  path: number[];
  crawlPaths: CrawlPaths;
  names: Set<string>;
  plugins: Plugin[];
  diagnosticTree?: DiagnosticTree;
}

const skippedNodes = new Set<SyntaxKind>();

let lastIdentifier: string | undefined;
let currentNodeKind: SyntaxKind | undefined;
let lastNodeKind: SyntaxKind | undefined;

const traverse = (options: TraverseInput) => {
  const {
    node,
    tree,
    lookups,
    path,
    crawlPaths,
    names,
    plugins,
    diagnosticTree,
  } = options;

  const nodeSiblingKinds: SyntaxKind[] = [];
  node.forEachChild((childNodeChild) => {
    nodeSiblingKinds.push(childNodeChild.kind);
  });

  node.forEachChild((childNode) => {
    lastNodeKind = currentNodeKind;
    currentNodeKind = childNode.kind;

    if (ignored(childNode)) {
      log(`Ignored node of type ${SyntaxKind[childNode.kind]}`);
      trackDeadEndDiagnostic(childNode, diagnosticTree);
      return;
    }

    // save name of likely component export
    if (
      possibleComponentExport(
        childNode.kind,
        lastNodeKind ?? 0,
        nodeSiblingKinds
      )
    ) {
      const nodeId = nodeName(childNode);
      if (/^[A-Z]/.test(nodeId)) {
        lastIdentifier = nodeId;
        log({
          lastIdentifier,
          lastNodeKind: SyntaxKind[lastNodeKind ?? 0],
          nodeSiblingKinds,
        });
      }
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

      trackDeadEndDiagnostic(childNode, diagnosticTree);
      return; // handled current node as import type
    }

    if (target(childNode)) {
      let parentNode = tree;

      if (lastIdentifier) {
        path.push(0);
        const { newNode } = saveElement({
          name: lastIdentifier,
          path,
          tree,
          lookups,
          names,
        });
        parentNode = newNode;
        lastIdentifier = undefined;
      }

      const newPath = [...path, parentNode.children.length];
      const element = jsxTag(childNode);
      const name = jsxTagName(element);

      const { newNode, newNodeId } = saveElement({
        name,
        path: newPath,
        lookups,
        names,
        tree: parentNode,
      });
      let newTree: NodeTree = newNode;

      // TODO: need better way to match known lib components
      // need to check name export and normalize for renames / aliasing
      const plugin = plugins.find(({ componentIds }) =>
        componentIds.includes(name)
      );

      if (plugin) {
        const pluginVisitorInputs = {
          id: newNodeId,
          name,
          element,
          tree: newNode,
          lookups,
          path: newPath,
          names,
        };
        const treeChange = plugin.visitComponent({
          ...pluginVisitorInputs,
          api: {
            saveElement: saveChildElement(pluginVisitorInputs),
          },
        });

        if (treeChange?.newNode) {
          newTree = treeChange.newNode;
        }
      }

      const nextDiagnosticTree = trackDiagnostic(
        DiagnosticReason.SavedElement,
        childNode.kind,
        diagnosticTree,
        newNodeId
      );
      traverse({
        node: childNode,
        tree: newTree,
        lookups,
        path: newPath,
        crawlPaths,
        names,
        plugins,
        diagnosticTree: nextDiagnosticTree,
      });
    } else if (interesting(childNode)) {
      const nextDiagnosticTree = trackDiagnostic(
        DiagnosticReason.Interesting,
        childNode.kind,
        diagnosticTree
      );
      traverse({
        node: childNode,
        tree,
        lookups,
        path,
        crawlPaths,
        names,
        plugins,
        diagnosticTree: nextDiagnosticTree,
      });
    } else {
      trackDeadEndDiagnostic(childNode, diagnosticTree);
      skippedNodes.add(childNode.kind);
    }
  });
};

export const traverseProject = async (
  projectRootPath: string,
  options: SharedOptions
) => {
  const dirname = path.dirname(projectRootPath);
  const program = await buildProgram(projectRootPath, options.compilerOptions);

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

  const orphanHierarchies: AstState[] = [];
  const diagnosticTree = options.runDiagnostic
    ? {
        children: [] as DiagnosticTree[],
      }
    : undefined;

  const result = await traverseFromFile(
    sourceFile,
    {
      ...options,
      dirname,
      projectFiles,
      program,
      diagnosticTree,
    },
    orphanHierarchies
  );

  orphanHierarchies.forEach((orphan, orphanIndex) => {
    const parentNodeName = orphan.hierarchy.children[0]?.name;
    const leafMatch = getLeafNode(
      parentNodeName,
      result.leafNodes,
      result.hierarchy
    );

    if (parentNodeName === "ActionList") {
      log("ACTION", JSON.stringify(orphan.hierarchy.children, null, 2));
    }

    // add node to main hierarchy and merge lookups
    if (leafMatch) {
      const [, parentNodePath] = leafMatch.matchingLeafNodeId.split("-");

      // leaf nodes
      result.leafNodes.delete(leafMatch.matchingLeafNodeId);
      orphan.leafNodes.forEach((orphanLeafNode) => {
        const [orphanName, orphanPath] = orphanLeafNode.split("-");
        const newLeafNode = `${orphanName}-${parentNodePath}.${orphanPath}`;
        result.leafNodes.add(newLeafNode);
      });
      leafMatch.leafNode.children.push(orphan.hierarchy.children[0]);

      // elements
      result.elements = Object.keys(orphan.elements).reduce(
        (acc, orphanElementId) => {
          const [orphanName, orphanPath] = orphanElementId.split("-");
          return {
            ...acc,
            [`${orphanName}-${parentNodePath}.${orphanPath}`]:
              orphan.elements[orphanElementId],
          };
        },
        result.elements
      );
    }

    // @ts-expect-error releasing the object reference, array used only once
    orphanHierarchies[orphanIndex] = null;
  });

  return { ...result, diagnosticTree };
};

export const traverseFromFile = async (
  sourceFile: SourceFile,
  options: TraverseOptions,
  orphanHierarchies: AstState[] = []
): Promise<AstState> => {
  const { projectFiles, dirname, program } = options;

  // lookups that persist across full system traversal
  const tree = createNode({ id: "_root", name: "_Root" });
  const lookups: NodeLookups = {
    files: {},
    leafNodes: new Set<Id>(),
    elements: {},
    thirdParty: {},
  };

  // lookups relevant for this file
  const names = new Set<string>();
  const crawlPaths = {};

  const diagnosticTree = trackDiagnosticFileBoundary(
    sourceFile.fileName,
    options.diagnosticTree
  );

  traverse({
    node: sourceFile,
    tree,
    lookups,
    path: [],
    crawlPaths,
    names,
    plugins: options.plugins ?? [],
    diagnosticTree,
  });

  const followableCrawlPaths = interestingCrawlPaths(crawlPaths, names);
  log({ followableCrawlPaths });

  if (dirname && followableCrawlPaths.length) {
    await followableCrawlPaths.reduce((chain, filePath) => {
      return chain.then(() => {
        return findPath(path.resolve(dirname, filePath)).then((subPath) => {
          if (!subPath) {
            throw new Error(
              `Exhausted possibilities resolving path to ${filePath} from ${dirname}`
            );
          }

          const subSource = program.getSourceFile(subPath);
          if (!subSource) {
            throw new Error(`Failed to traverse to ${subPath}`);
          }

          return traverseFromFile(
            subSource,
            { ...options, diagnosticTree },
            orphanHierarchies
          ).then((result) => {
            orphanHierarchies.push(result);
          });
        });
      });
    }, Promise.resolve() as Promise<unknown>);
  }

  log({
    skippedNodes: Array.from(skippedNodes).map((kind) => SyntaxKind[kind]),
  });

  return {
    ...lookups,
    hierarchy: tree,
    orphanHierarchies,
  };
};

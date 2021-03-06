import path from "path";
import { ImportDeclaration, Node, SourceFile, SyntaxKind } from "typescript";
import { log } from "./debug.util";
import {
  DiagnosticReason,
  DiagnosticTree,
  trackDeadEndDiagnostic,
  trackDiagnostic,
  trackDiagnosticFileBoundary,
} from "./diagnostic.util";
import { findPath, pathAsRelativeToRoot } from "./fs.util";
import {
  handleImportDeclaration,
  interestingCrawlPaths,
  trackIndirectImportBinding,
} from "./imports";
import {
  createNode,
  getLeafNode,
  ignored,
  interesting,
  jsxTag,
  jsxTagName,
  nodeName,
  possibleComponentExport,
  saveElement,
  target,
} from "./node.util";
import { applyPlugins } from "./plugins";
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
  fileId: number;
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
    fileId,
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
      handleImportDeclaration(childNode as ImportDeclaration, crawlPaths);
      trackDeadEndDiagnostic(childNode, diagnosticTree);
      return; // handled current node as import type
    }

    trackIndirectImportBinding(childNode, crawlPaths);

    if (target(childNode)) {
      let parentNode = tree;

      if (lastIdentifier) {
        path.push(0);
        const { newNode } = saveElement({
          name: lastIdentifier,
          path,
          fileId,
          tree,
          lookups,
          names,
          crawlPaths,
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
        fileId,
        lookups,
        names,
        crawlPaths,
        tree: parentNode,
      });
      let newTree: NodeTree = newNode;

      const pluginTreeRoot = applyPlugins({
        id: newNodeId,
        name,
        element,
        tree: newNode,
        fileId,
        lookups,
        path: newPath,
        names,
        crawlPaths,
        plugins,
      });

      if (pluginTreeRoot) {
        newTree = pluginTreeRoot;
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
        fileId,
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
        fileId,
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
  const tree = createNode({ id: "_root", name: "_Root", fileId: 0 });
  const lookups: NodeLookups = {
    files: options.nodeFiles ?? {},
    leafNodes: options.leafNodes ?? new Set<Id>(),
    elements: options.elements ?? {},
    thirdParty: options.thirdParty ?? {},
  };

  // lookups relevant for this file
  const names = new Set<string>();
  const crawlPaths = {};

  const diagnosticTree = trackDiagnosticFileBoundary(
    sourceFile.fileName,
    options.diagnosticTree
  );

  const fileId = Object.keys(lookups.files).length + 1;
  lookups.files[fileId] = pathAsRelativeToRoot(dirname, sourceFile.fileName);

  traverse({
    node: sourceFile,
    tree,
    fileId,
    lookups,
    path: [],
    crawlPaths,
    names,
    plugins: options.plugins ?? [],
    diagnosticTree,
  });

  const followableCrawlPaths = interestingCrawlPaths(
    crawlPaths,
    names,
    pathAsRelativeToRoot(dirname, sourceFile.fileName)
  );
  log({ followableCrawlPaths });

  if (dirname && followableCrawlPaths.length) {
    await followableCrawlPaths.reduce((chain, filePath) => {
      return chain.then(() => {
        return findPath(path.resolve(filePath)).then((subPath) => {
          if (!subPath) {
            throw new Error(
              `Exhausted possibilities resolving path to ${filePath} from ${dirname}`
            );
          }

          const relativeRootPath = pathAsRelativeToRoot(dirname, subPath);
          const subSource = program.getSourceFile(relativeRootPath);
          if (!subSource) {
            throw new Error(`Failed to traverse to ${relativeRootPath}`);
          }

          return traverseFromFile(
            subSource,
            {
              ...options,
              thirdParty: lookups.thirdParty,
              nodeFiles: lookups.files,
              diagnosticTree,
            },
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

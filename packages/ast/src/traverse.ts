import ts, {
  ImportDeclaration,
  ImportSpecifier,
  Node,
  SourceFile,
  SyntaxKind,
} from "typescript";
import { log } from "./debug.util";
import {
  createNode,
  encodeId,
  interesting,
  jsxTag,
  jsxTagName,
  nodeName,
  target,
} from "./node.util";
import { AstState, NodeLookups, NodeTree } from "./types";

let lastIdentifier: string | undefined;

const traverse = (
  node: Node | SourceFile,
  tree: NodeTree,
  lookups: NodeLookups,
  path: number[]
) => {
  let filteredIndex = 0;
  node.forEachChild((childNode) => {
    // save name of component export
    if (childNode.kind === SyntaxKind.Identifier) {
      lastIdentifier = nodeName(childNode);
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

      log("import", {
        bindings: bindings.map(
          (binding: ImportSpecifier) => binding.name.escapedText
        ),
        module: (importNode.moduleSpecifier as any).text,
      });
    }

    if (target(childNode)) {
      let parentNode = tree;

      if (lastIdentifier) {
        path.push(filteredIndex);
        filteredIndex = 0; // reset index for depth change
        const parentNodeId = encodeId(lastIdentifier, path);
        parentNode = createNode(parentNodeId);
        lookups.elements[parentNodeId] = { name: lastIdentifier };
        tree.children.push(parentNode);
        lastIdentifier = undefined;
      }

      const newPath = [...path, filteredIndex];
      const element = jsxTag(childNode);
      const name = jsxTagName(element);
      const id = encodeId(name, newPath);
      const newTree = createNode(id);
      lookups.elements[id] = { name };
      parentNode.children.push(newTree);

      traverse(childNode, newTree, lookups, newPath);
      filteredIndex++;
    } else if (interesting(childNode)) {
      traverse(childNode, tree, lookups, path);
    }
  });
};

export const traverseFromFile = (filePath: string): AstState => {
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

  const nodeTree = createNode("_root");
  const lookups = {
    files: {},
    elements: {},
  };

  traverse(sourceFile, nodeTree, lookups, []);

  return {
    ...lookups,
    hierarchy: nodeTree,
  };
};

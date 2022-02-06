import ts, {
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  JsxElement,
  JsxOpeningElement,
  JsxSelfClosingElement,
  Node,
  SourceFile,
  SyntaxKind,
} from "typescript";
import { log } from "./debug.util";
import { createNode, interesting, jsxValueName, target } from "./node.util";
import { AstState, NodeLookups, NodeTree } from "./types";

const saveJsxElement = (
  node: JsxElement | JsxSelfClosingElement,
  tree: NodeTree,
  lookups: NodeLookups
) => {
  let element: JsxSelfClosingElement | JsxOpeningElement;

  if (node.kind === SyntaxKind.JsxElement) {
    element = node.openingElement;
  } else {
    element = node;
  }

  let id = (element.tagName as Identifier).escapedText as string;
  const { tagName, attributes } = element;

  switch (tagName.kind) {
    case SyntaxKind.Identifier:
      id = tagName.escapedText as string;
      break;
    case SyntaxKind.PropertyAccessExpression:
      id = (tagName.expression as Identifier).escapedText as string;
      id += ".";
      id += tagName.name.escapedText as string;
      break;
  }

  const props = attributes.properties.reduce((acc, attr) => {
    if (attr.kind !== SyntaxKind.JsxAttribute) {
      return acc;
    }

    return {
      ...acc,
      [attr.name.escapedText as string]: jsxValueName(attr.initializer),
    };
  }, {});

  const savedNode = createNode(id);
  lookups.elements[savedNode.id] = { name: id };
  tree.children.push(savedNode);
  return savedNode;
};

let lastIdentifier: string | undefined;

const traverse = (
  node: Node | SourceFile | undefined,
  tree: NodeTree,
  lookups: NodeLookups
) => {
  if (!node) {
    log("! no node ! did you pass a valid entry file path?");
    process.exit(1);
  }

  node.forEachChild((childNode) => {
    // save name of component export
    if (childNode.kind === SyntaxKind.Identifier) {
      lastIdentifier = (childNode as Identifier).escapedText as string;
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
        parentNode = createNode(lastIdentifier);
        lookups.elements[parentNode.id] = { name: lastIdentifier };
        tree.children.push(parentNode);
        lastIdentifier = undefined;
      }
      const newTree = saveJsxElement(childNode, parentNode, lookups);
      traverse(childNode, newTree, lookups);
    } else if (interesting(childNode)) {
      traverse(childNode, tree, lookups);
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

  const nodeTree = createNode("_root");
  const lookups = {
    files: {},
    elements: {},
  };

  traverse(sourceFile, nodeTree, lookups);

  return {
    ...lookups,
    hierarchy: nodeTree,
  };
};

const repeat = (str: string, times: number) =>
  Array.from(new Array(times)).reduce((acc) => acc + str, "");

const tab = (times: number) => repeat("  ", times);

export const renderTreeText = (tree: NodeTree, depth = 1): string => {
  if (tree.children.length === 0) {
    return `<${tree.id} />`;
  }
  return `<${tree.id}>\n${
    tree.children
      .map((child) => tab(depth) + renderTreeText(child, depth + 1) + "\n")
      .join("") + tab(depth - 1)
  }</${tree.id}>`;
};

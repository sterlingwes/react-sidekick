import ts, {
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  JsxElement,
  JsxExpression,
  JsxOpeningElement,
  JsxSelfClosingElement,
  Node,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from "typescript";

const debug = process.env.DEBUG;
const log = (...args: any[]) => {
  if (debug) console.log(...args);
};

const createNode = (
  id: string,
  element?: JsxElement | JsxSelfClosingElement
) => ({
  id,
  element,
  children: [],
});

interface NodeTree {
  id: string;
  element?: JsxElement | JsxSelfClosingElement;
  children: NodeTree[];
}

const interestingTypes = [
  SyntaxKind.ArrowFunction,
  SyntaxKind.Block,
  SyntaxKind.FirstStatement,
  SyntaxKind.ParenthesizedExpression,
  SyntaxKind.ReturnStatement,
  SyntaxKind.VariableDeclaration,
  SyntaxKind.VariableDeclarationList,
];

const interesting = (node: Node) => {
  return interestingTypes.includes(node.kind);
};

const target = (node: Node): node is JsxElement | JsxSelfClosingElement =>
  node.kind === SyntaxKind.JsxElement ||
  node.kind === SyntaxKind.JsxSelfClosingElement;

const jsxValueName = (node: JsxExpression | StringLiteral | undefined) => {
  if (node?.kind === SyntaxKind.JsxExpression) {
    const exp = (node as JsxExpression).expression;
    if (exp?.kind === SyntaxKind.Identifier) {
      return (exp as Identifier).escapedText;
    }
  } else if (node?.kind === SyntaxKind.StringLiteral) {
    return (node as StringLiteral).text;
  }

  return null;
};

const saveJsxElement = (
  node: JsxElement | JsxSelfClosingElement,
  tree: NodeTree
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

  const savedNode = createNode(id, node);
  tree.children.push(savedNode);
  return savedNode;
};

let lastIdentifier: string | undefined;

const traverse = (node: Node | SourceFile | undefined, tree: NodeTree) => {
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
        tree.children.push(parentNode);
        lastIdentifier = undefined;
      }
      const newTree = saveJsxElement(childNode, parentNode);
      traverse(childNode, newTree);
    } else if (interesting(childNode)) {
      traverse(childNode, tree);
    }
  });
};

export const traverseFromFile = (filePath: string) => {
  const program = ts.createProgram([filePath], {
    noEmitOnError: true,
    noImplicitAny: false,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });

  const sourceFile = program.getSourceFile(filePath);

  const nodeTree = createNode("_root");

  traverse(sourceFile, nodeTree);
  return nodeTree;
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
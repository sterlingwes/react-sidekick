import {
  Identifier,
  JsxElement,
  JsxExpression,
  JsxOpeningElement,
  JsxSelfClosingElement,
  Node,
  StringLiteral,
  SyntaxKind,
} from "typescript";
import { AncestralId, Id } from "./types";

export const encodeId = (name: string, ancestralPath: number[]): AncestralId =>
  name + "-" + ancestralPath.map((index) => index.toString(36)).join(".");

export const createNode = (id: Id) => ({
  id,
  children: [],
});

/**
 * add any types here that could reasonably lead us to a JSX Element
 */
const interestingTypes = [
  SyntaxKind.ArrowFunction,
  SyntaxKind.Block,
  SyntaxKind.CallExpression,
  SyntaxKind.FirstStatement,
  SyntaxKind.JsxAttribute,
  SyntaxKind.JsxAttributes,
  SyntaxKind.JsxExpression,
  SyntaxKind.JsxOpeningElement,
  SyntaxKind.ObjectLiteralExpression,
  SyntaxKind.ParenthesizedExpression,
  SyntaxKind.PropertyAssignment,
  SyntaxKind.ReturnStatement,
  SyntaxKind.VariableDeclaration,
  SyntaxKind.VariableDeclarationList,
];

export const interesting = (node: Node) => {
  return interestingTypes.includes(node.kind);
};

export const possibleComponentExport = (
  currentKind: SyntaxKind,
  lastKind: SyntaxKind,
  siblingKinds: SyntaxKind[]
) => {
  return (
    lastKind === SyntaxKind.VariableDeclaration &&
    currentKind === SyntaxKind.Identifier &&
    siblingKinds.includes(SyntaxKind.ArrowFunction)
  );
};

/**
 * add any types here that would mark a part of the tree we're not
 * interested in traversing further
 */
const ignoredTypes = [SyntaxKind.JsxClosingElement];

export const ignored = (node: Node) => {
  return ignoredTypes.includes(node.kind);
};

export const target = (
  node: Node
): node is JsxElement | JsxSelfClosingElement =>
  node.kind === SyntaxKind.JsxElement ||
  node.kind === SyntaxKind.JsxSelfClosingElement;

export const jsxValueName = (
  node: JsxExpression | StringLiteral | undefined
) => {
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

export const jsxTag = (node: JsxElement | JsxSelfClosingElement) => {
  if (node.kind === SyntaxKind.JsxElement) {
    return node.openingElement;
  } else {
    return node;
  }
};

export const jsxTagName = (node: JsxSelfClosingElement | JsxOpeningElement) => {
  let name = nodeName(node.tagName);
  const { tagName } = node;

  switch (tagName.kind) {
    case SyntaxKind.Identifier:
      name = tagName.escapedText as string;
      break;
    case SyntaxKind.PropertyAccessExpression:
      name = nodeName(tagName.expression);
      name += ".";
      name += tagName.name.escapedText as string;
      break;
  }

  return name;
};

export const jsxProps = (
  node: JsxSelfClosingElement | JsxOpeningElement
): Record<string, unknown> => {
  const { attributes } = node;
  const props = attributes.properties.reduce((acc, attr) => {
    if (attr.kind !== SyntaxKind.JsxAttribute) {
      return acc;
    }

    return {
      ...acc,
      [attr.name.escapedText as string]: jsxValueName(attr.initializer),
    };
  }, {});

  return props;
};

export const nodeName = (node: Node) =>
  (node as Identifier).escapedText as string;

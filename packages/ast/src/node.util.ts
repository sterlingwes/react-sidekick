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

const interestingTypes = [
  SyntaxKind.ArrowFunction,
  SyntaxKind.Block,
  SyntaxKind.FirstStatement,
  SyntaxKind.ParenthesizedExpression,
  SyntaxKind.ReturnStatement,
  SyntaxKind.VariableDeclaration,
  SyntaxKind.VariableDeclarationList,
];

export const interesting = (node: Node) => {
  return interestingTypes.includes(node.kind);
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

export const jsxProps = (node: JsxSelfClosingElement | JsxOpeningElement) => {
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

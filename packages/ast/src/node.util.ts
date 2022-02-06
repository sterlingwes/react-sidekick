import {
  Identifier,
  JsxElement,
  JsxExpression,
  JsxSelfClosingElement,
  Node,
  StringLiteral,
  SyntaxKind,
} from "typescript";
import { Id } from "./types";

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

import { SyntaxKind } from "typescript";
import { DiagnosticReason, DiagnosticTree } from "./diagnostic.util";
import { tab } from "./string.util";
import { NodeLookups, NodeTree } from "./types";

export const renderTreeText = (tree: NodeTree, depth = 1): string => {
  const { name } = tree;
  if (tree.children.length === 0) {
    return `<${name} />`;
  }
  return `<${name}>\n${
    tree.children
      .map((child) => tab(depth) + renderTreeText(child, depth + 1) + "\n")
      .join("") + tab(depth - 1)
  }</${name}>`;
};

export const renderDiagnosticText = (
  tree: DiagnosticTree,
  depth = 1
): string => {
  const { id, reason, kind } = tree;
  let name = "????????";

  if (id && !reason && !kind) {
    name = `!---- ${id} ----------------------------`;
  } else if (kind && reason) {
    name = `${SyntaxKind[kind]} ${DiagnosticReason[reason]}`;
  } else {
    name = `${SyntaxKind[kind ?? SyntaxKind.Unknown]}${id ? ` (${id}) ` : " "}${
      DiagnosticReason[reason ?? DiagnosticReason.Unknown]
    }`;
  }

  if (tree.children.length === 0) {
    return `<${name} />`;
  }
  return `<${name}>\n${
    tree.children
      .map(
        (child) => tab(depth) + renderDiagnosticText(child, depth + 1) + "\n"
      )
      .join("") + tab(depth - 1)
  }</${name}>`;
};

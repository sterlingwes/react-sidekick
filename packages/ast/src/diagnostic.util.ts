import { Node, SyntaxKind } from "typescript";

export enum DiagnosticReason {
  SavedElement,
  Interesting,
  Skipped,
  Unknown,
}

export interface DiagnosticTree {
  id?: string;
  kind?: SyntaxKind;
  reason?: DiagnosticReason;
  children: DiagnosticTree[];
}

export const trackDiagnostic = (
  reason: DiagnosticReason,
  kind: SyntaxKind,
  tree?: DiagnosticTree,
  id?: string
) => {
  if (!tree) return;

  const newNode = {
    id,
    kind: kind,
    reason,
    children: [],
  };

  tree.children.push(newNode);

  return newNode;
};

export const trackDeadEndDiagnostic = (node: Node, tree?: DiagnosticTree) => {
  if (!tree) return;

  const newNode = {
    kind: node.kind,
    reason: DiagnosticReason.Skipped,
    children: [],
  };

  tree.children.push(newNode);

  node.forEachChild((child) => trackDeadEndDiagnostic(child, newNode));

  return newNode;
};

export const trackDiagnosticFileBoundary = (
  filePath: string,
  tree?: DiagnosticTree
) => {
  if (!tree) return;

  const newNode = {
    id: filePath,
    children: [],
  };

  tree.children.push(newNode);

  return newNode;
};

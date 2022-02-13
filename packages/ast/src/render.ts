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

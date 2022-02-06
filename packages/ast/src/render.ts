import { tab } from "./string.util";
import { NodeLookups, NodeTree } from "./types";

export const renderTreeText = (
  tree: NodeTree,
  elements: NodeLookups["elements"],
  depth = 1
): string => {
  const el = elements[tree.id];
  const name = el ? el.name : tree.id;
  if (tree.children.length === 0) {
    return `<${name} />`;
  }
  return `<${name}>\n${
    tree.children
      .map(
        (child) =>
          tab(depth) + renderTreeText(child, elements, depth + 1) + "\n"
      )
      .join("") + tab(depth - 1)
  }</${name}>`;
};

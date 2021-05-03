import {
  ReactTestRendererTree,
  ReactTestRendererJSON,
  ReactTestRendererNode,
} from "react-test-renderer";

//
// producing JS
//

const react = "g.react";
const rn = (elementType: string) => `g.rn.${elementType}`;
const asFragment = (children: string): string =>
  `${react}.createElement(${react}.Fragment, null, ${children})`;

const transformProps = (node: ReactTestRendererJSON) => {
  switch (node.type) {
    case "Image":
      const { source, ...restProps } = node.props || {};
      return JSON.stringify({
        style: {
          ...restProps.style,
          width: 200,
          height: 200,
        },
        ...restProps,
        source: "replace-uri",
      }).replace('"replace-uri"', "g.placeholderImage");
    default:
      return JSON.stringify(node.props);
  }
};

const createElement = (node: ReactTestRendererJSON): string =>
  `${react}.createElement(${rn(node.type)}, ${transformProps(node)}, ${
    node.children ? traversePrimitiveTree(node.children) : "undefined"
  })`;

const traversePrimitiveTree = (children: ReactTestRendererNode[]): string => {
  if (Array.isArray(children) === false) {
    return "undefined";
  }

  return children
    .map((child) => {
      if (typeof child === "string") {
        return JSON.stringify(child);
      }
      return createElement(child);
    })
    .join(",");
};

//
// public API
//

export const transform = (testInstanceJson: ReactTestRendererNode) => {
  return asFragment(traversePrimitiveTree([testInstanceJson]));
};

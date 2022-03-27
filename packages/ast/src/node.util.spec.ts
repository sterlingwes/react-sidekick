import { SyntaxKind } from "typescript";
import { getLeafNode, jsxProps } from "./node.util";

describe("node util", () => {
  describe("getLeafNode", () => {
    it("should return the node that matches the node ID path", () => {
      const childParentName = "TopComponent";

      const parentHierarchyNodeLeafs = new Set(["TopComponent-0.0"]);
      const parentHierarchy = {
        id: "root",
        name: "Root",
        fileId: 0,
        children: [
          {
            id: "Parent-0",
            name: "Parent",
            fileId: 1,
            children: [
              {
                id: "TopComponent-0.0",
                name: "TopComponent",
                fileId: 1,
                children: [],
              },
            ],
          },
        ],
      };

      const node = getLeafNode(
        childParentName,
        parentHierarchyNodeLeafs,
        parentHierarchy
      );

      expect(node).toEqual({
        leafNode: {
          children: [],
          fileId: 1,
          id: "TopComponent-0.0",
          name: "TopComponent",
        },
        matchingLeafNodeId: "TopComponent-0.0",
      });
    });
  });

  describe("jsxProps", () => {
    describe("react-navigation screen component with non-literal prop values", () => {
      const sampleNode = {
        kind: SyntaxKind.JsxSelfClosingElement,
        attributes: {
          kind: SyntaxKind.JsxAttributes,
          properties: [
            {
              kind: SyntaxKind.JsxAttribute,
              name: {
                kind: SyntaxKind.Identifier,
                escapedText: "name",
              },
              initializer: {
                kind: SyntaxKind.JsxExpression,
                expression: {
                  kind: SyntaxKind.PropertyAccessExpression,
                  expression: {
                    kind: SyntaxKind.Identifier,
                    escapedText: "SomeVar",
                  },
                  name: {
                    kind: SyntaxKind.Identifier,
                    escapedText: "someComponentProperty",
                  },
                },
              },
            },
            {
              kind: SyntaxKind.JsxAttribute,
              name: {
                kind: SyntaxKind.Identifier,
                escapedText: "component",
              },
              initializer: {
                kind: SyntaxKind.JsxExpression,
                expression: {
                  kind: SyntaxKind.Identifier,
                  escapedText: "ScreenComponent",
                },
              },
            },
          ],
        },
      };

      it("should still return those prop values by var name", () => {
        // @ts-expect-error test fixture is a subset of type
        const props = jsxProps(sampleNode);
        expect(props).toEqual({
          component: "ScreenComponent",
          name: "SomeVar.someComponentProperty",
        });
      });
    });
  });
});

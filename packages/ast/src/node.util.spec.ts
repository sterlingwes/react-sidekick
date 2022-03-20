import { getLeafNode } from "./node.util";

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
});

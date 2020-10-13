import { ReactTestRendererTree } from "react-test-renderer";

export const rnSimpleFixture: ReactTestRendererTree = {
  nodeType: "component",
  type: "SomeComponent",
  props: { style: { flex: 1 } },
  instance: null,
  children: null,
  rendered: [
    {
      nodeType: "component",
      type: "View",
      props: { style: { backgroundColor: "red" } },
      instance: null,
      children: null,
      rendered: {
        nodeType: "host",
        type: "View",
        props: { style: { flex: 1, backgroundColor: "red" } },
        instance: null,
        rendered: null,
        children: null,
      },
    },
  ],
};

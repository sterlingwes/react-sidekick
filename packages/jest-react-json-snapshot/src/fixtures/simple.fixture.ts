import { ReactTestRendererTree } from "react-test-renderer";

export const simpleFixture: ReactTestRendererTree[] = [
  {
    nodeType: "component",
    type: "MyComponent",
    props: { style: { flex: 1, backgroundColor: "red" } },
    instance: null,
    children: null,
    rendered: {
      nodeType: "host",
      type: "View",
      props: { style: { flex: 1, backgroundColor: "red" } },
      instance: null,
      children: null,
      rendered: {
        nodeType: "host",
        type: "View",
        props: { style: { backgroundColor: "blue" } },
        instance: null,
        rendered: null,
        children: null,
      },
    },
  },
];

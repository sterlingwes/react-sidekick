# react-test-render-transformer

This package takes a React view hierarchy "tree" as rendered by `react-test-renderer` and boils it down to the javscript calls required to render your view. For now, this only supports React Native (View, Text, TextInput, etc).

To use it you'll often want to just call `transform` with a rendered tree:

```jsx
import { transform } from "react-test-render-transformer";
import TestRenderer from "react-test-renderer";

const element = <MyComponent />;
const testRenderer = TestRenderer.create(element);
const tree = testRenderer.toTree();

const jsString = transform(tree);
```

For an example of what `jsString` looks like, check out [this test snapshot](src/__snapshots__/index.test.ts.snap).

There are two other methods which together perform parts of what `transform` does:

- **transformToSimpleTree**: which boils down the test renderer tree into just the primitive hierarchy
- **transformToSimpleTree**: which takes the primitive hierarchy returned by `transformToSimpleTree` and outputs the same jsString shown in the example above.

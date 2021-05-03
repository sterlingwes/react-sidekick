# react-test-render-transformer

This package takes a React view hierarchy JSON tree as rendered by `react-test-renderer` and boils it down to the javscript calls required to render your view. For now, this only supports React Native (View, Text, TextInput, etc).

To use it you'll often want to just call `transform` with a rendered tree:

```jsx
import { transform } from "react-test-render-transformer";
import TestRenderer from "react-test-renderer";

const element = <MyComponent />;
const testRenderer = TestRenderer.create(element);
const tree = testRenderer.toJSON();

const jsString = transform(tree);
```

For an example of what `jsString` looks like, check out [this test snapshot](src/__snapshots__/index.test.ts.snap).

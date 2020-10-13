import { ReactTestRendererTree } from "react-test-renderer";

const rnComponent = [
  "ActivityIndicator",
  "Animated",
  "ARTText",
  "Button",
  "CheckBox",
  "ClippingRectangle",
  "DatePickerIOS",
  "DrawerLayoutAndroid",
  "FlatList",
  "Group",
  "Image",
  "ImageBackground",
  "InputAccessoryView",
  "KeyboardAvoidingView",
  "ListView",
  "MaskedViewIOS",
  "Modal",
  "NavigatorIOS",
  "Picker",
  "PickerIOS",
  "PickerIOSItem",
  "ProgressBarAndroid",
  "ProgressViewIOS",
  "RecyclerViewBackedScrollView",
  "RefreshControl",
  "SafeAreaView",
  "ScrollView",
  "SectionList",
  "SegmentedControlIOS",
  "Shape",
  "Slider",
  "SnapshotViewIOS",
  "StatusBar",
  "Surface",
  "SwipeableListView",
  "Switch",
  "SwitchIOS",
  "TabBarIOS",
  "TabBarIOSItem",
  "Text",
  "TextInput",
  "ToolbarAndroid",
  "TouchableHighlight",
  "TouchableNativeFeedback",
  "TouchableOpacity",
  "TouchableWithoutFeedback",
  "View",
  "ViewPagerAndroid",
  "VirtualizedList",
];

//
// traversing / parsing
//

const rnPrimitiveName = (node: ReactTestRendererTree) => {
  if (!node.type || node.nodeType !== "host") {
    return undefined;
  }

  const isRnElement = rnComponent.includes(node.type);

  if (typeof node.type === "string" && isRnElement) {
    return node.type;
  }

  return undefined;
};

type RenderableNode = SimpleNode | string;

type SimpleNode = {
  type: string;
  props: Object;
  children: SimpleNode[] | RenderableNode[] | undefined;
};

type AnyProps = { [x: string]: any };

const propsLessChildren = ({ children: _, ...props }: AnyProps): AnyProps =>
  props;

const simplifyNode = (
  primitiveName: string,
  node: ReactTestRendererTree,
  children?: RenderableNode[]
): SimpleNode => ({
  type: primitiveName,
  props: propsLessChildren(node.props),
  children,
});

const traverseTestTree = (
  rendered: ReactTestRendererTree | ReactTestRendererTree[]
): RenderableNode[] => {
  const children =
    typeof rendered === "object" && "length" in rendered
      ? rendered
      : [rendered];

  return children.reduce<RenderableNode[]>((acc, childNode) => {
    if (typeof childNode === "string") {
      return acc.concat(childNode);
    }

    const primitive = rnPrimitiveName(childNode);
    const hasChildren = childNode.rendered != null;

    if (primitive && hasChildren) {
      return acc.concat(
        simplifyNode(
          primitive,
          childNode,
          traverseTestTree(childNode.rendered!)
        )
      );
    } else if (hasChildren) {
      return acc.concat(traverseTestTree(childNode.rendered!));
    } else if (primitive) {
      return acc.concat(simplifyNode(primitive, childNode));
    } else {
      return acc;
    }
  }, []);
};

//
// producing JS
//

const react = "g.react";
const rn = (elementType: string) => `g.rn.${elementType}`;
const asFragment = (children: string): string =>
  `${react}.createElement(${react}.Fragment, null, ${children})`;

const createElement = (node: SimpleNode): string =>
  `${react}.createElement(${rn(node.type)}, ${JSON.stringify(node.props)}, ${
    node.children ? traversePrimitiveTree(node.children) : "undefined"
  })`;

const traversePrimitiveTree = (children: RenderableNode[]): string => {
  if (!children || children.length === 0) {
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

export const transform = (testInstanceTree: ReactTestRendererTree) => {
  const { rendered } = testInstanceTree;
  if (!rendered) {
    throw new Error(`Provided test instance has not rendered state`);
  }
  const primitiveTree = traverseTestTree(rendered);
  return asFragment(traversePrimitiveTree(primitiveTree));
};

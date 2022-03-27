import { jsxProps } from "../node.util";
import { ComponentVisitorApi, PluginVisitor } from "../types";

export const importNames = [
  "createNativeStackNavigator",
  "createStackNavigator",
];

type RouteName = string;
type ComponentName = string;

interface NavigationLookup {
  routes: Record<RouteName, ComponentName>;
  components: Set<string>;
}

export const namespace = "reactNavigation";
export const sourceModules = [
  "@react-navigation/native-stack",
  "@react-navigation/stack",
];

const initializeNavLookup = (
  api: ComponentVisitorApi<NavigationLookup>
): NavigationLookup => {
  const metadata = api.getMetadata();
  if (metadata) {
    return metadata as NavigationLookup;
  }

  const navLookup = {
    routes: {},
    components: new Set<string>(),
  };

  return api.saveMetadata(navLookup);
};

export const visitComponent: PluginVisitor<NavigationLookup> = ({
  element,
  names,
  api,
}) => {
  const navLookup = initializeNavLookup(api);

  const props = jsxProps(element);
  if (typeof props.name === "string" && typeof props.component === "string") {
    navLookup.routes[props.name] = props.component;
    navLookup.components.add(props.component);
    names.add(props.component);

    return api.saveElement(props.component);
  }
};

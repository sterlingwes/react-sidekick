import { jsxProps } from "../node.util";
import { ComponentVisitorApi, PluginVisitor } from "../types";

export const componentIds = ["Stack.Screen"];

type RouteName = string;
type ComponentName = string;

interface NavigationLookup {
  routes: Record<RouteName, ComponentName>;
  components: Set<string>;
}

export const pluginName = "reactNavigation";

const initializeNavLookup = (api: ComponentVisitorApi): NavigationLookup => {
  const metadata = api.getMetadata();
  if (metadata) {
    return metadata as NavigationLookup;
  }

  const navLookup = {
    routes: {},
    components: new Set<string>(),
  };

  api.saveMetadata(navLookup);

  return navLookup;
};

export const visitComponent: PluginVisitor = ({
  name,
  element,
  names,
  api,
}) => {
  if (name !== "Stack.Screen") {
    return;
  }

  const navLookup = initializeNavLookup(api);

  const props = jsxProps(element);
  if (typeof props.name === "string" && typeof props.component === "string") {
    navLookup.routes[props.name] = props.component;
    navLookup.components.add(props.component);
    names.add(props.component);

    return api.saveElement(props.component);
  }
};

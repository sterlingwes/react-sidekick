import { jsxProps } from "../node.util";
import { NodeLookups, PluginVisitor } from "../types";

export const componentIds = ["Stack.Screen"];

type RouteName = string;
type ComponentName = string;

interface NavigationLookup {
  routes: Record<RouteName, ComponentName>;
  components: Set<string>;
}

const initializeNavLookup = (lookups: NodeLookups): NavigationLookup => {
  if (lookups.thirdParty.reactNavigation) {
    return lookups.thirdParty.reactNavigation as NavigationLookup;
  }

  const navLookup = {
    routes: {},
    components: new Set<string>(),
  };

  lookups.thirdParty.reactNavigation = navLookup;

  return navLookup;
};

export const visitComponent: PluginVisitor = ({
  name,
  element,
  lookups,
  names,
}) => {
  if (name !== "Stack.Screen") {
    return;
  }

  const navLookup = initializeNavLookup(lookups);

  const props = jsxProps(element);
  if (typeof props.name === "string" && typeof props.component === "string") {
    navLookup.routes[props.name] = props.component;
    navLookup.components.add(props.component);
    names.add(props.component);
  }
};

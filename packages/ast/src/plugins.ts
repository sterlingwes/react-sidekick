import { saveChildElement } from "./node.util";
import {
  ComponentVisitorInput,
  CrawlPaths,
  Plugin,
  PluginVisitorInputs,
} from "./types";

const getPlugin = (crawlPaths: CrawlPaths, plugins: Plugin[]) => {
  return plugins.find(({ importNames, sourceModules }) => {
    const modulesToMatch = Object.keys(crawlPaths).filter((modulePath) => {
      if (modulePath.charAt(0) === ".") return false;
      return sourceModules.includes(modulePath);
    });

    if (!modulesToMatch.length) return false;

    const componentMatch = modulesToMatch.find((moduleName) => {
      return crawlPaths[moduleName].find(({ name, alias }) => {
        const matchName = alias ?? name;
        return importNames.includes(matchName);
      });
    });

    return !!componentMatch;
  });
};

const providePluginApi = <T>(
  namespace: string,
  pluginVisitorInputs: PluginVisitorInputs
) => ({
  api: {
    saveElement: saveChildElement(pluginVisitorInputs),
    getMetadata: () => pluginVisitorInputs.lookups.thirdParty[namespace],
    saveMetadata: (metadata: T) => {
      // @ts-expect-error need to fix generic usage
      pluginVisitorInputs.lookups.thirdParty[namespace] = metadata;
      return pluginVisitorInputs.lookups.thirdParty[namespace];
    },
  },
});

type PluginApplicatorInputs = Omit<ComponentVisitorInput, "api"> & {
  plugins: Plugin[];
};

export const applyPlugins = ({
  id,
  name,
  element,
  tree,
  fileId,
  lookups,
  path,
  names,
  crawlPaths,
  plugins,
}: PluginApplicatorInputs) => {
  const plugin = getPlugin(crawlPaths, plugins);

  if (plugin) {
    const pluginVisitorInputs = {
      id,
      name,
      element,
      tree,
      fileId,
      lookups,
      path,
      names,
      crawlPaths,
    };
    // @ts-expect-error need to fix generic usage
    const treeChange = plugin.visitComponent({
      ...pluginVisitorInputs,
      ...providePluginApi(plugin.namespace, pluginVisitorInputs),
    });

    if (treeChange?.newNode) {
      return treeChange.newNode;
    }
  }
};

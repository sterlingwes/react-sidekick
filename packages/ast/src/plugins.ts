import { saveChildElement } from "./node.util";
import { ComponentVisitorInput, Plugin, PluginVisitorInputs } from "./types";

const getPlugin = (jsxTagName: string, plugins: Plugin[]) => {
  return plugins.find(({ componentIds }) => componentIds.includes(jsxTagName));
};

const providePluginApi = (
  pluginName: string,
  pluginVisitorInputs: PluginVisitorInputs
) => ({
  api: {
    saveElement: saveChildElement(pluginVisitorInputs),
    getMetadata: () => pluginVisitorInputs.lookups.thirdParty[pluginName],
    saveMetadata: (metadata: Record<string, unknown>) => {
      pluginVisitorInputs.lookups.thirdParty[pluginName] = metadata;
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
  plugins,
}: PluginApplicatorInputs) => {
  const plugin = getPlugin(name, plugins);

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
    };
    const treeChange = plugin.visitComponent({
      ...pluginVisitorInputs,
      ...providePluginApi(plugin.pluginName, pluginVisitorInputs),
    });

    if (treeChange?.newNode) {
      return treeChange.newNode;
    }
  }
};

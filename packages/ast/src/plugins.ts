import { saveChildElement } from "./node.util";
import { PluginVisitorInputs } from "./types";

export const providePluginApi = (
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

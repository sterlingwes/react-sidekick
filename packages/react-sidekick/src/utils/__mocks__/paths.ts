const fakeBasePath = "/Users/you/someproject";
const rnHostModulePath = "node_modules/react-sidekick-native-host";

export const resolvePackage = (packageName: string) => {
  if (packageName === "react-sidekick-native-host") {
    return `${fakeBasePath}/${rnHostModulePath}`;
  }

  throw new Error(`resolvePackage is missing mock path for ${packageName}`);
};

export const getProjectPath = () => {
  return "/Users/you/someproject";
};

const appBundlePath = `${fakeBasePath}/${rnHostModulePath}/rnfastview.app`;
const bundlePath = `${appBundlePath}/main.jsbundle`;
const backupPath = `${appBundlePath}/main.jsbundlebackup`;

export const paths = { appBundlePath, bundlePath, backupPath };

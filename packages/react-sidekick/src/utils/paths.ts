import { exec } from "./exec";

export const resolvePackage = (packageName: string) => {
  const path = require.resolve(packageName);
  const [basePath, mainPath] = path.split(packageName);
  return `${basePath}${packageName}`;
};

const nativeHostBasePath = resolvePackage("@react-sidekick/native-host");

const appPath = "rnfastview.app";
const appBundlePath = `${nativeHostBasePath}/${appPath}`;
const backupFileName = "main.jsbundlebackup";
const bundleName = "main.jsbundle";
const bundlePath = `${nativeHostBasePath}/${appPath}/${bundleName}`;
const backupPath = `${nativeHostBasePath}/${appPath}/${backupFileName}`;

export const getProjectPath = () => {
  return process.cwd();
};

export const getConfigPath = () => {
  return `${getProjectPath()}/.react-sidekick`;
};

export const ensureConfigPath = async () => {
  await exec(`mkdir -p ${getConfigPath()}`);
};

export const paths = {
  nativeHostBasePath,
  appBundlePath,
  bundlePath,
  backupPath,
};

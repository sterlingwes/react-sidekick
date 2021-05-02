export const resolvePackage = (packageName: string) => {
  const path = require.resolve(packageName);
  const [basePath, mainPath] = path.split(packageName);
  return `${basePath}${packageName}`;
};

const basePath = resolvePackage("@react-sidekick/native-host");

const appPath = "rnfastview.app";
const appBundlePath = `${basePath}/${appPath}`;
const backupFileName = "main.jsbundlebackup";
const bundleName = "main.jsbundle";
const bundlePath = `${basePath}/${appPath}/${bundleName}`;
const backupPath = `${basePath}/${appPath}/${backupFileName}`;

export const getProjectPath = () => {
  return process.cwd();
};

export const paths = {
  appBundlePath,
  bundlePath,
  backupPath,
};

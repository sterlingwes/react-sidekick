import { spawnWithLog } from "./utils/exec";
import { getConfigPath, paths } from "./utils/paths";

const buildIOS = async () => {
  const xcbuildArgs = [
    "-workspace",
    `${paths.nativeHostBasePath}/ios/rnfastview.xcworkspace`,
    "-scheme",
    "rnfastview",
    "-configuration",
    "Release",
    "-sdk",
    "iphonesimulator",
    "-destination",
    "platform=iOS Simulator,name=iPhone 11",
  ];
  const buildPath = `${getConfigPath()}/build-ios`;
  const logPath = `${buildPath}/xcbuild-log`;
  console.log(`running xcodebuild with args: ${xcbuildArgs.join(' ')} with local build path: ${buildPath}`)
  await spawnWithLog(
    "xcodebuild",
    [...xcbuildArgs, "-derivedDataPath", `${buildPath}`],
    logPath
  );
};

export const buildRendererApp = async () => {
  await buildIOS();
};

import { exec } from "./utils/exec";
import { getProjectPath } from "./utils/paths";
import { Frame } from "./utils/stack-frame-parser";

const getRelativeProjectPath = (contextPath: string): string => {
  const basePath = getProjectPath();
  return contextPath.replace(`${basePath}/`, "");
};

const makeFolderPath = (contextPath: string): string => {
  return contextPath.replace(/^\//, "").replace(/[\/\.]+/g, "-");
};

type ArtifactLocation = {
  folder: string;
  filename: string;
};

const artifactFolder = "__artifacts__";

const getBaseArtifactPath = () => {
  const baseProjectPath = getProjectPath();
  return `${baseProjectPath}/${artifactFolder}`;
};

export const getScreenshotFilePath = (
  context: Frame,
  platform: "ios" | "android" = "ios"
): ArtifactLocation => {
  const folder = makeFolderPath(getRelativeProjectPath(context.filePath));
  return {
    folder,
    filename: `${context.lineNumber}-${context.column}-${platform}.png`,
  };
};

export const prepScreenshotPath = async (context: Frame): Promise<string> => {
  const location = getScreenshotFilePath(context);
  await exec(`mkdir -p ${getBaseArtifactPath()}/${location.folder}`);
  return `${getBaseArtifactPath()}/${location.folder}/${location.filename}`;
};

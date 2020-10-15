import { statSync } from "fs";
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

type Platform = "ios" | "android";

const getFilename = (
  folder: string,
  context: Frame,
  platform: Platform
): string => {
  let baseFilename = `${context.lineNumber}-${context.column}-${platform}`;
  const makeFullPath = (offset?: number): [string, string] => [
    `${getBaseArtifactPath()}/${folder}/`,
    `${baseFilename}${offset ? `-${offset}` : ""}.png`,
  ];
  let nextPath = makeFullPath();
  let exists = true;
  let count = 0;
  while (exists) {
    try {
      console.log(`checking screenshot path ${nextPath}`);
      statSync(nextPath.join(""));
      count++;
      nextPath = makeFullPath(count);
      continue;
    } catch {
      exists = false;
    }
  }

  return nextPath[1];
};

export const getScreenshotFilePath = (
  context: Frame,
  platform: Platform = "ios"
): ArtifactLocation => {
  const folder = makeFolderPath(getRelativeProjectPath(context.filePath));
  return {
    folder,
    filename: getFilename(folder, context, platform),
  };
};

export const prepScreenshotPath = async (context: Frame): Promise<string> => {
  const location = getScreenshotFilePath(context);
  await exec(`mkdir -p ${getBaseArtifactPath()}/${location.folder}`);
  return `${getBaseArtifactPath()}/${location.folder}/${location.filename}`;
};

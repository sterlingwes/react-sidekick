import fs from "fs";

const hasExtension = (filePath: string) => /\.[a-z0-9A-Z]{2,3}/.test(filePath);
const extensions = [".ts", ".tsx", "/index.ts", "/index.tsx"];

const fileExists = (path: string) => {
  return new Promise((resolve) => {
    fs.access(path, (err) => (err ? resolve(false) : resolve(true)));
  });
};

const asyncFindExtensionMatch = (extensions: string[], filePath: string) => {
  return extensions.reduce((chain, ext) => {
    return chain.then((match) => {
      if (match) return match;
      const testPath = `${filePath}${ext}`;
      return fileExists(testPath).then((exists) =>
        exists ? testPath : undefined
      );
    });
  }, Promise.resolve() as Promise<undefined | string>);
};

export const findPath = async (filePath: string) => {
  if (hasExtension(filePath)) {
    return filePath;
  }

  return asyncFindExtensionMatch(extensions, filePath);
};

export const pathAsRelativeToRoot = (dirname: string, path: string) => {
  if (path.startsWith(dirname)) return path;
  const rootPathStartIndex = path.indexOf(dirname.slice(2));
  let relativeRootPath = path;
  if (rootPathStartIndex > 0) {
    relativeRootPath = `./${path.slice(rootPathStartIndex)}`;
  }

  return relativeRootPath;
};

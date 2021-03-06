import path from "path";
import { createProject } from "@ts-morph/bootstrap";
import { Dirent, readdir, readFile } from "fs";
import ts, { JsxEmit } from "typescript";
import { CompilerOptions } from "./types";

const readFilePromise = (path: string) =>
  new Promise<string>((resolve, reject) => {
    readFile(path, (err, data) =>
      err ? reject(err) : resolve(data.toString())
    );
  });

const directoryOfInterest = (dirName: string) =>
  dirName !== "node_modules" &&
  !dirName.startsWith("__") &&
  !dirName.startsWith(".");

const isRootDir = (acc: string[]) => acc.length === 0;

const fileOfInterest = (fileName: string) =>
  fileName.endsWith(".tsx") || fileName.includes("index.ts");

const haveNotTraversedSrcYet = (acc: string[], item: Dirent, dirPath: string) =>
  item.isDirectory() &&
  isRootDir(acc) &&
  dirPath.includes("src") === false &&
  item.name !== "src";

const resolveFilesFromDirectory = (
  dirPath: string,
  filesAccumulated: string[] = []
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    readdir(dirPath, { withFileTypes: true }, (err, dirents) => {
      if (err) return reject(err);
      const files = dirents.reduce((chain, item) => {
        return chain.then((acc) => {
          if (item.isFile() && fileOfInterest(item.name)) {
            return acc.concat(`${dirPath}/${item.name}`);
          }

          if (haveNotTraversedSrcYet(acc, item, dirPath)) {
            return acc;
          }

          if (item.isDirectory() && directoryOfInterest(item.name)) {
            return resolveFilesFromDirectory(`${dirPath}/${item.name}`).then(
              (recursedFiles) => acc.concat(recursedFiles)
            );
          }

          return acc;
        });
      }, Promise.resolve(filesAccumulated) as Promise<string[]>);

      resolve(files);
    });
  });
};

const buildVirtualProgram = async (rootEntryFilePath: string) => {
  const project = await createProject({ useInMemoryFileSystem: true });
  const rootDir = path.dirname(rootEntryFilePath);
  const files = await resolveFilesFromDirectory(rootDir);
  await files.reduce((chain, filePath) => {
    return chain
      .then(() => readFilePromise(filePath))
      .then((fileContents) => {
        try {
          project.createSourceFile(filePath, fileContents);
        } catch (err) {
          console.error("Read file error:", err);
        }
      });
  }, Promise.resolve() as Promise<unknown>);

  return project.createProgram();
};

export const buildProgram = async (
  projectRootEntryFilePath: string,
  compilerOptions?: CompilerOptions
) => {
  if (compilerOptions?.virtualFs) {
    const program = await buildVirtualProgram(projectRootEntryFilePath);
    return program;
  }

  return ts.createProgram([projectRootEntryFilePath], {
    noEmitOnError: true,
    noImplicitAny: false,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    jsx: JsxEmit.React,
  });
};

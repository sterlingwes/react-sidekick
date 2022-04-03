import * as vscode from "vscode";
import { vfsUri } from "../utils";

/**
 * throws if file is not accessible, returns undefined
 * if it is
 */
export const access = (
  file: string,
  callback: (e: Error | undefined) => void
) => {
  const uri = vfsUri(file);
  vscode.workspace.fs.stat(uri).then(
    (stat) => {
      if (stat.type === vscode.FileType.File) {
        callback(undefined);
      } else {
        const err = new Error(`${file} is not accessible`);
        // @ts-expect-error
        err.stat = stat;
        callback(err);
      }
    },
    (err) => callback(err)
  );
};

export const readFile = (
  path: string,
  callback: (e: Error | null, data?: string) => void
) => {
  const uri = vfsUri(path);
  vscode.workspace.fs.readFile(uri).then(
    (fileUintArray) => callback(null, new TextDecoder().decode(fileUintArray)),
    (e: Error) => {
      console.error("readFile error", { path, uri, e });
      callback(e);
    }
  );
};

interface NodeFsDirent {
  name: string;
  isDirectory: () => boolean;
  isFile: () => boolean;
  isSymbolicLink: () => boolean;
}

const asDirent = ([name, type]: [string, vscode.FileType]) => ({
  name,
  isDirectory: () => type === vscode.FileType.Directory,
  isFile: () => type === vscode.FileType.File,
  isSymbolicLink: () => type === vscode.FileType.SymbolicLink,
});

export const readdir = (
  path: string,
  options: { withFileTypes: true },
  callback: (err: Error | null, files?: NodeFsDirent[]) => void
) => {
  const uri = vfsUri(path);
  vscode.workspace.fs.readDirectory(uri).then(
    (fileTuples) => {
      callback(
        null,
        fileTuples.map((tuple) => asDirent(tuple))
      );
    },
    (err: Error) => {
      console.error("readdir error", { path, uri, err });
      callback(err);
    }
  );
};

export default {
  access,
  readFile,
  readdir,
};

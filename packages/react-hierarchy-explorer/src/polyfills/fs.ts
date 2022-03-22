import * as vscode from "vscode";

/**
 * throws if file is not accessible, returns undefined
 * if it is
 */
export const access = (
  file: string,
  callback: (e: Error | undefined) => void
) => {
  vscode.workspace.fs.stat(vscode.Uri.file(file)).then(
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
    (err) => {
      callback(err);
    }
  );
};

export const readFile = (
  path: string,
  callback: (e: Error | null, data?: string) => void
) => {
  vscode.workspace.fs.readFile(vscode.Uri.file(path)).then(
    (fileUintArray) => callback(null, new TextDecoder().decode(fileUintArray)),
    (e: Error) => callback(e)
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
  vscode.workspace.fs.readDirectory(vscode.Uri.file(path)).then(
    (fileTuples) => {
      callback(
        null,
        fileTuples.map((tuple) => asDirent(tuple))
      );
    },
    (err: Error) => callback(err)
  );
};

export default {
  access,
  readFile,
  readdir,
};

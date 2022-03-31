import * as vscode from "vscode";

export const vfsUri = (filePath: string) => {
  let uri = vscode.Uri.file(filePath);
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    uri = vscode.Uri.joinPath(workspaceFolder.uri, filePath);
  }

  return uri;
};

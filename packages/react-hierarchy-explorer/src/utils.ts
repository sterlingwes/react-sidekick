import * as vscode from "vscode";

const shouldJoinWorkspace = (
  workspace: vscode.WorkspaceFolder,
  filePath: string
) => {
  return `file://${filePath}`.startsWith(workspace.uri.toString()) === false;
};

export const vfsUri = (filePath: string) => {
  let uri = vscode.Uri.file(filePath);
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder && shouldJoinWorkspace(workspaceFolder, filePath)) {
    uri = vscode.Uri.joinPath(workspaceFolder.uri, filePath);
  }

  return uri;
};

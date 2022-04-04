import * as vscode from "vscode";

export const vfsUri = (filePath: string) => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (workspaceFolder && workspaceFolder.uri.scheme === "vscode-vfs") {
    const workspaceBase = workspaceFolder.uri.path;
    // virtual workspaces on github in particular always include the org/repo path
    // and the workspace.fs calls also include those, so dupe path appending seems to occur
    if (filePath.startsWith(workspaceBase)) {
      return vscode.Uri.joinPath(
        workspaceFolder.uri,
        filePath.replace(workspaceBase, "")
      );
    }
  }

  return vscode.Uri.file(filePath);
};

import * as vscode from "vscode";
import { TreeProvider } from "./tree-provider";

const viewId = "reactHierarchy";

export function activate(context: vscode.ExtensionContext) {
  const provider = new TreeProvider();
  // vscode.window.registerTreeDataProvider(viewId, provider);

  const treeView = vscode.window.createTreeView(viewId, {
    treeDataProvider: provider,
  });

  provider.refresh();

  let refreshDisposable = vscode.commands.registerCommand(
    viewId + ".refreshEntry",
    () => provider.refresh()
  );

  let focusDisposable = vscode.commands.registerCommand(
    viewId + ".focusRelatedFile",
    (e) => {
      provider.focusRelatedFile(e);
    }
  );

  let diagnosticDisposable = vscode.commands.registerCommand(
    viewId + ".printDiagnostic",
    () => provider.runDiagnostic()
  );

  context.subscriptions.push(refreshDisposable);
  context.subscriptions.push(focusDisposable);
  context.subscriptions.push(diagnosticDisposable);
}

export function deactivate() {}

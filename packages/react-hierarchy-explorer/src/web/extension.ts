import * as vscode from "vscode";
import { TreeProvider } from "./tree-provider";

const viewId = "reactHierarchy";

export function activate(context: vscode.ExtensionContext) {
  const provider = new TreeProvider();

  const treeView = vscode.window.createTreeView(viewId, {
    treeDataProvider: provider,
  });

  treeView.onDidChangeVisibility((e) => {
    if (e.visible) {
      provider.refresh();
    } else {
      provider.onHide();
    }
  });

  let refreshDisposable = vscode.commands.registerCommand(
    viewId + ".refreshEntry",
    () => provider.refresh()
  );

  let focusDisposable = vscode.commands.registerCommand(
    viewId + ".focusRelatedFile",
    (e) => {
      if (!e || !e.node) {
        vscode.window.showInformationMessage(
          "This command only works from the item action button in the sidebar treeview."
        );
        return;
      }
      provider.focusRelatedFile(e);
    }
  );

  let diagnosticDisposable = vscode.commands.registerCommand(
    viewId + ".printDiagnostic",
    () => provider.runDiagnostic()
  );

  let exportDisposable = vscode.commands.registerCommand(
    viewId + ".exportHierarchy",
    () => provider.exportHierarchy()
  );

  let collapseTree = vscode.commands.registerCommand(
    viewId + ".collapseTree",
    () => provider.collapseTree()
  );

  let expandTree = vscode.commands.registerCommand(viewId + ".expandTree", () =>
    provider.expandTree()
  );

  context.subscriptions.push(refreshDisposable);
  context.subscriptions.push(focusDisposable);
  context.subscriptions.push(diagnosticDisposable);
  context.subscriptions.push(exportDisposable);
  context.subscriptions.push(collapseTree);
  context.subscriptions.push(expandTree);
}

export function deactivate() {}

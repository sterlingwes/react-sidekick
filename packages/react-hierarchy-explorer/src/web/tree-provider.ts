import * as vscode from "vscode";
import { traverseProject } from "@react-sidekick/ast/dist/traverse";
import { NodeTree, SharedOptions } from "@react-sidekick/ast/dist/types";
import { renderDiagnosticText } from "@react-sidekick/ast/dist/render";

const collapsedStateForNode = (
  node: NodeTree,
  defaultState: vscode.TreeItemCollapsibleState
) =>
  node.children?.length > 0
    ? defaultState
    : vscode.TreeItemCollapsibleState.None;

enum NodeType {
  reactNavigationScreen,
  component,
}

const iconByType = Object.freeze({
  [NodeType.reactNavigationScreen]: new vscode.ThemeIcon("device-mobile"),
  [NodeType.component]: new vscode.ThemeIcon("symbol-function"),
});

export class ReactNode extends vscode.TreeItem {
  public node: NodeTree;
  public type: NodeType;
  private static defaultCollapsedState =
    vscode.TreeItemCollapsibleState.Expanded;

  constructor(node: NodeTree) {
    super(
      node.name,
      collapsedStateForNode(node, ReactNode.defaultCollapsedState)
    );
    this.node = node;
    this.contextValue = "node";
    this.type = NodeType.component;
    this.iconPath = iconByType[this.type];
  }

  static setDefaultState(state: vscode.TreeItemCollapsibleState) {
    ReactNode.defaultCollapsedState = state;
  }

  setType(type: NodeType) {
    this.type = type;
    this.iconPath = iconByType[type];
  }
}

const collapseLikeNamedNodes = true;

export class TreeProvider implements vscode.TreeDataProvider<ReactNode> {
  private hierarchy: NodeTree | undefined;
  private nodeFiles: Record<number, string> | undefined;
  private reactNavigationRouteNames: Set<string> | undefined;
  private traverseOptions: SharedOptions = {
    runDiagnostic: false,
  };

  private _onDidChangeTreeData: vscode.EventEmitter<
    ReactNode | undefined | null | void
  > = new vscode.EventEmitter<ReactNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ReactNode | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private dataResetting = false;

  async collapseTree() {
    ReactNode.setDefaultState(vscode.TreeItemCollapsibleState.Collapsed);

    this.dataResetting = true;
    this._onDidChangeTreeData.fire();

    return this.refresh();
  }

  async expandTree() {
    ReactNode.setDefaultState(vscode.TreeItemCollapsibleState.Expanded);

    this.dataResetting = true;
    this._onDidChangeTreeData.fire();

    return this.refresh();
  }

  async refresh() {
    const [firstWorkspace] = vscode.workspace.workspaceFolders || [];
    if (!firstWorkspace) {
      // vscode.window.showErrorMessage(
      //   "You must open a react workspace before you can explore it."
      // );
      return;
    }

    vscode.commands.executeCommand(
      "setContext",
      "reactHierarchy.loadingTreeView",
      true
    );

    const { runDiagnostic } = this.traverseOptions;

    let result;
    try {
      result = await traverseProject(`${firstWorkspace.uri.path}/App.tsx`, {
        plugins: [
          require("@react-sidekick/ast/dist/libraries/react-navigation"),
        ],
        runDiagnostic,
        compilerOptions: { virtualFs: true },
      });
      this.hierarchy = result.hierarchy;
      this.nodeFiles = result.files;
      this.reactNavigationRouteNames = (
        result.thirdParty.reactNavigation as any
      )?.components;

      console.log({ result });
    } catch (e) {
      console.error("Could not traverseProject", e);
    }

    this.dataResetting = false;

    vscode.commands.executeCommand(
      "setContext",
      "reactHierarchy.loadingTreeView",
      false
    );

    this._onDidChangeTreeData.fire();

    return result;
  }

  onHide() {
    // do something with this
  }

  focusRelatedFile({ node }: ReactNode) {
    const file = this.nodeFiles?.[node.fileId];
    if (file) {
      const uri = vscode.Uri.file(file);
      vscode.commands.executeCommand("vscode.open", uri).then(
        () => console.log("Opened " + file),
        (err) => console.warn("Failed to open " + file, err)
      );
    } else {
      console.warn("File does not exist for node: ", { node });
    }
  }

  async runDiagnostic() {
    this.traverseOptions.runDiagnostic = true;
    const result = await this.refresh();
    if (result?.diagnosticTree) {
      console.log("diagnostic:", renderDiagnosticText(result.diagnosticTree));
    } else {
      console.warn("no diagnostic available");
    }
  }

  getTreeItem(element: ReactNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: ReactNode): vscode.ProviderResult<ReactNode[]> {
    if (!this.hierarchy || this.dataResetting) {
      return [];
    }

    if (element) {
      return this.addEachNode(element.node.children);
    } else {
      return this.addEachNode(this.hierarchy.children);
    }
  }

  private addEachNode(nodes: NodeTree[]) {
    return nodes.map((node) => {
      if (
        collapseLikeNamedNodes &&
        node.children.length === 1 &&
        node.name === node.children[0].name
      ) {
        return this.withTypeReset(new ReactNode(node.children[0]));
      }

      return this.withTypeReset(new ReactNode(node));
    });
  }

  private withTypeReset(reactNode: ReactNode) {
    if (this.isReactNavigationScreen(reactNode)) {
      reactNode.setType(NodeType.reactNavigationScreen);
    }
    return reactNode;
  }

  private isReactNavigationScreen({ node }: ReactNode) {
    return this.reactNavigationRouteNames?.has(node.name);
  }
}

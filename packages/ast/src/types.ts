import { JsxOpeningElement, JsxSelfClosingElement, Node } from "typescript";

export type Id = string; // "Component-ANCESTRAL_ID"
export type ComponentName = string; // "Component"
export type AncestralId = string; // "ANCESTRAL_ID"
type FilePath = string; // "workspace/path/file.ts"
type FileExport = Id;
type Binding = string;
export type CrawlPaths = Record<FilePath, Binding[]>;

interface ComponentVisitorInput {
  id: Id;
  name: ComponentName;
  element: JsxSelfClosingElement | JsxOpeningElement;
  tree: NodeTree;
  lookups: NodeLookups;
  path: number[];
  names: Set<string>;
  api: ComponentVisitorApi;
}

interface ComponentVisitorApi {
  saveElement: (name: ComponentName) => TreeChange;
}

interface TreeChange {
  newNode?: NodeTree;
}

export type PluginVisitor = (
  input: ComponentVisitorInput
) => TreeChange | undefined;

export interface Plugin {
  componentIds: string[];
  visitComponent: PluginVisitor;
}

export interface NodeTree {
  id: Id;
  name: ComponentName;
  children: NodeTree[];
}

interface FileProperties {
  start: AncestralId;
  end: AncestralId[];
  uses: FilePath[];
}

export interface NodeElement {
  name: ComponentName;
  file?: FilePath;
}

export interface NodeLookups {
  files: Record<FilePath, Record<FileExport, FileProperties>>;
  leafNodes: Set<Id>;
  elements: Record<Id, NodeElement>;
  thirdParty: Record<string, unknown>;
}

export interface AstState extends NodeLookups {
  hierarchy: NodeTree;
  orphanHierarchies: AstState[];
}

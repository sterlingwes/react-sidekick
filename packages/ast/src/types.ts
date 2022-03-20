import { JsxOpeningElement, JsxSelfClosingElement, Program } from "typescript";
import { DiagnosticTree } from "./diagnostic.util";

export type Id = string; // "Component-ANCESTRAL_ID"
export type ComponentName = string; // "Component"
export type AncestralId = string; // "ANCESTRAL_ID"
type FilePath = string; // "workspace/path/file.ts"
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

export interface ComponentVisitorApi {
  saveElement: (name: ComponentName) => TreeChange;
  getMetadata: () => unknown;
  saveMetadata: (metadata: Record<string, unknown>) => void;
}

interface TreeChange {
  newNode?: NodeTree;
}

export type PluginVisitor = (
  input: ComponentVisitorInput
) => TreeChange | undefined;

export interface Plugin {
  pluginName: string;
  componentIds: string[];
  visitComponent: PluginVisitor;
}

export interface NodeTree {
  id: Id;
  name: ComponentName;
  children: NodeTree[];
  fileId: number;
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
  files: Record<number, string>;
  leafNodes: Set<Id>;
  elements: Record<Id, NodeElement>;
  thirdParty: Record<string, unknown>;
}

export interface AstState extends NodeLookups {
  hierarchy: NodeTree;
  orphanHierarchies: AstState[];
}

export interface CompilerOptions {
  virtualFs: boolean;
}

export interface SharedOptions {
  plugins?: Plugin[];
  runDiagnostic?: boolean;
  compilerOptions?: CompilerOptions;
}

export interface TraverseOptions extends SharedOptions {
  dirname: string;
  projectFiles: string[];
  nodeFiles?: Record<number, string>;
  program: Program;
  diagnosticTree?: DiagnosticTree;
}

export interface SaveInputs {
  name: ComponentName;
  path: number[];
  tree: NodeTree;
  fileId: number;
  lookups: NodeLookups;
  names: Set<string>;
}

export type PluginVisitorInputs = Omit<SaveInputs, "name">;

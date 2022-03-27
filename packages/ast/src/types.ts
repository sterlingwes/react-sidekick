import { JsxOpeningElement, JsxSelfClosingElement, Program } from "typescript";
import { DiagnosticTree } from "./diagnostic.util";

export type Id = string; // "Component-ANCESTRAL_ID"
export type ComponentName = string; // "Component"
export type AncestralId = string; // "ANCESTRAL_ID"
type FilePath = string; // "workspace/path/file.ts"
export type ImportBinding = { name: string; alias: string | undefined };
export type CrawlPaths = Record<FilePath, ImportBinding[]>;

type PluginState = Record<string, unknown>;

export interface ComponentVisitorInput<PState = PluginState> {
  id: Id;
  name: ComponentName;
  element: JsxSelfClosingElement | JsxOpeningElement;
  tree: NodeTree;
  fileId: number;
  lookups: NodeLookups;
  path: number[];
  names: Set<string>;
  crawlPaths: CrawlPaths;
  api: ComponentVisitorApi<PState>;
}

export interface ComponentVisitorApi<PState = PluginState> {
  saveElement: (name: ComponentName) => TreeChange;
  getMetadata: () => PState;
  saveMetadata: <PState>(metadata: PState) => PState;
}

interface TreeChange {
  newNode?: NodeTree;
}

export type PluginVisitor<PState = PluginState> = (
  input: ComponentVisitorInput<PState>
) => TreeChange | undefined;

export interface Plugin<PState = PluginState> {
  namespace: string;
  sourceModules: string[];
  importNames: string[];
  visitComponent: PluginVisitor<PState>;
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
  source?: string;
}

export interface NodeLookups {
  files: Record<number, string>;
  leafNodes: Set<Id>;
  elements: Record<Id, NodeElement>;
  thirdParty: Record<string, PluginState>;
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

export interface TraverseOptions extends SharedOptions, Partial<NodeLookups> {
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
  crawlPaths: CrawlPaths;
}

export type PluginVisitorInputs = Omit<SaveInputs, "name">;

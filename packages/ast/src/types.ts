export type Id = string; // "Component-ANCESTRAL_ID"
type Name = string; // "Component"
type AncestralId = string; // "ANCESTRAL_ID"
type FilePath = string; // "workspace/path/file.ts"
type FileExport = Id;

export interface NodeTree {
  id: Id;
  children: NodeTree[];
}

interface FileProperties {
  start: AncestralId;
  end: AncestralId[];
  uses: FilePath[];
}

interface NodeElement {
  name: Name;
  file?: FilePath;
}

export interface NodeLookups {
  files: Record<FilePath, Record<FileExport, FileProperties>>;
  elements: Record<Id, NodeElement>;
}

export interface AstState extends NodeLookups {
  hierarchy: NodeTree;
}

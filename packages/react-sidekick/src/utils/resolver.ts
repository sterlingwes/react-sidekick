import glob from "glob";

export const resolveSnapshotDeclarations = (
  globPattern: string
): Array<string> => {
  return glob.sync(globPattern);
};

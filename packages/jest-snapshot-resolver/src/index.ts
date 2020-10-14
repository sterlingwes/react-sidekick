import path from "path";
import glob from "glob";

const defaultOptions = {
  ignore: ["**/node_modules/**", "**/ios/**", "**/android/**"],
};

export const resolveAllSnapshotPaths = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    glob("**/*.snap", defaultOptions, function (err, files) {
      if (err) return reject(err);
      resolve(files);
    });
  });
};

const cwd = process.cwd();
const pathRelativeToCwd = (modulePath: string) => path.resolve(cwd, modulePath);
const sidekickTest = /source\": \"react-test-render-transformer/;

const createSnapshotFilter = (valuePattern: RegExp = sidekickTest) => (
  modulePath: string
): boolean => {
  const snapshot = require(pathRelativeToCwd(modulePath));
  const match = Object.keys(snapshot).find((name) => {
    const snapshotValue = snapshot[name];
    return valuePattern.test(snapshotValue);
  });

  return !!match;
};

type SnapshotValue = {
  meta: {
    source: string;
    callSite: CallContext | null;
  };
  tree: any;
};

type CallContext = {
  filePath: string;
  lineNumber: number;
  column: number;
};

type Snapshot = {
  path: string;
  name: string;
  value: SnapshotValue;
};

type SnapshotMap = {
  [path: string]: Snapshot[];
};

const parseSnapshotValue = (value: string): SnapshotValue | null => {
  try {
    return JSON.parse(value.replace(/^\s+Array\s+/, ""));
  } catch (e) {
    return null;
  }
};

export const gatherSnapshots = (modulePaths: string[]): SnapshotMap => {
  return modulePaths
    .filter(createSnapshotFilter())
    .reduce((acc, modulePath) => {
      const snapshotModule = require(pathRelativeToCwd(modulePath));
      const snapshots = Object.keys(snapshotModule).map((key) => ({
        path: modulePath,
        name: key,
        value: parseSnapshotValue(snapshotModule[key]),
      }));

      return { ...acc, [modulePath]: snapshots };
    }, {});
};

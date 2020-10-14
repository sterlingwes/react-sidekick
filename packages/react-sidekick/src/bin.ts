import {
  transformSimpleTree,
  RenderableNode,
} from "react-test-render-transformer";
import {
  resolveAllSnapshotPaths,
  gatherSnapshots,
} from "jest-snapshot-resolver";

const asNode = (snapshotValue: any): RenderableNode[] => snapshotValue;

const run = async () => {
  console.log("finding snapshots...");
  const paths = await resolveAllSnapshotPaths();
  console.log(`${paths.length} snapshots found`);
  const snapshotMap = await gatherSnapshots(paths);
  const filteredMap = Object.values(snapshotMap);
  console.log(`Parsing ${filteredMap.length} valid snapshots...`);
  filteredMap.forEach((snapshots) => {
    snapshots.forEach((snapshot) => {
      const jsString = transformSimpleTree(asNode(snapshot.value.tree));
      console.log(">>", jsString);
    });
  });
};

run();

import { transformSimpleTree } from "react-test-render-transformer";
import {
  resolveAllSnapshotPaths,
  gatherSnapshots,
  Snapshot,
} from "jest-snapshot-resolver";

import { snapshot } from "./main";
import { boot } from "./simctl";
import { waitForQueue, getQueueLength } from "./snapshot-queue";

const run = async () => {
  await boot();

  console.log("finding snapshots...");
  const paths = await resolveAllSnapshotPaths();
  console.log(`${paths.length} snapshots found`);
  const snapshotMap = await gatherSnapshots(paths);
  const filteredMap: Array<Snapshot[]> = Object.values(snapshotMap);
  console.log(`Parsing ${filteredMap.length} valid snapshots...`);
  filteredMap.forEach((jestSnapshots) => {
    jestSnapshots.forEach((jestSnapshot) => {
      if (!jestSnapshot.value) {
        console.log(`Snapshot is null for "${jestSnapshot.name}", skipping`);
        return;
      }

      const jsString = transformSimpleTree(jestSnapshot.value.tree);
      const { callSite } = jestSnapshot.value.meta;

      if (!callSite) {
        console.log(
          "No callsite metadata for snapshot, unable to render",
          snapshot.name
        );
        return;
      }

      snapshot(jsString, callSite, jestSnapshot.name);
    });
  });

  const queueLength = getQueueLength();
  if (queueLength > 0) {
    console.log(`working through snapshot queue of ${queueLength}...`);
    await waitForQueue();
  }
  console.log("done!");
};

run();

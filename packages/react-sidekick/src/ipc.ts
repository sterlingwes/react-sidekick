import { Frame } from "./utils/stack-frame-parser";

export type TeardownOptions = {
  skipShutdown: boolean;
};

type SnapshotMessage = {
  method: "snapshot";
  jsString: string;
  callContext: Frame;
};

type LogMessage = {
  method: "log";
};

type TeardownMessage = {
  method: "teardown";
  options: TeardownOptions;
};

export type IPCMessage = SnapshotMessage | LogMessage | TeardownMessage;

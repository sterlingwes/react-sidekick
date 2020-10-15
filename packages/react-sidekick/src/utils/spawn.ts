import * as ChildProcess from "child_process";

const { spawn: _spawn } = ChildProcess;

const debugMode = !!process.env.DEBUG;

type EventHandlers = {
  onData: (data: Buffer) => any;
  onError: (data: Buffer) => any;
  onClose: (code: number) => any;
};

const setupEventHandlers = (
  proc: ChildProcess.ChildProcessWithoutNullStreams,
  eventHandlers: EventHandlers
) => {
  proc.stdout.on("data", (data) => {
    eventHandlers.onData(data);
  });

  proc.stderr.on("data", (data) => {
    if (data) {
      eventHandlers.onError(data);
    }
  });

  proc.on("close", (code) => {
    eventHandlers.onClose(code);
  });
};

type EventType = "onData" | "onError" | "onClose";
export type Predicate<T> = (type: EventType, data: Buffer | number) => T;

const defaultOptions = {
  resolvePredicate: (eventType: EventType, eventData: Buffer | number) =>
    eventType === "onClose",
  rejectPredicate: (eventType: EventType, eventData: Buffer | number) =>
    undefined,
  // add timeout option w/ reject
};

type Options = {
  resolvePredicate: Predicate<boolean>;
  rejectPredicate: Predicate<Error | undefined>;
};

type SpawnArgs = [string, ReadonlyArray<string>];

const joinCommand = (spawnArgs: SpawnArgs) =>
  `spawn: ${spawnArgs[0]} ${
    Array.isArray(spawnArgs[1]) ? spawnArgs.join(" ") : ""
  }`;

export const spawn = (
  spawnArgs: SpawnArgs,
  options: Options = defaultOptions
): Promise<Buffer> => {
  const { resolvePredicate, rejectPredicate } = options;
  if (debugMode) console.log(joinCommand(spawnArgs));
  const proc = _spawn(...spawnArgs);

  return new Promise((resolve, reject) => {
    let resolved = false;
    const end = (err?: Error | Buffer | string | null, result?: Buffer) => {
      if (resolved) {
        console.log(
          `already resolved ${joinCommand(
            spawnArgs
          )} but tried to end() again with`,
          { err, result }
        );
        return;
      }

      proc.kill();
      resolved = true;

      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    };

    setupEventHandlers(proc, {
      onData: (data) => {
        if (debugMode) console.log("onData", data.toString());
        if (resolvePredicate("onData", data)) {
          end(null, data);
          return;
        }

        const err = rejectPredicate("onData", data);
        if (err) {
          end(err);
          return;
        }
      },

      onError: (data) => {
        if (debugMode) console.log("onError", data.toString());
        if (resolvePredicate("onError", data)) {
          end(data);
          return;
        }

        const err = rejectPredicate("onError", data);
        if (err) {
          end(err);
          return;
        }
      },

      onClose: (data) => {
        if (debugMode) console.log("onClose", data);
        if (resolvePredicate("onClose", data)) {
          end();
          return;
        }

        // reject instead on specific error codes?
        const err = rejectPredicate("onClose", data);
        if (err) {
          end(err);
          return;
        }
      },
    });
  });
};

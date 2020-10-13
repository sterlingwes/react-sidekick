import { watchLogs } from "./log-consumer";
import * as SpawnMock from "./utils/spawn";
import {
  malformedTargetJsonData,
  unsoughtJsonData,
} from "./fixtures/ios-log-stream";

jest.mock("./utils/spawn", () => {
  let predicateFn: any;
  return {
    spawn: (_: string[], { resolvePredicate }: any) => {
      predicateFn = resolvePredicate;
    },
    _callPredicate: (...args: any[]) => predicateFn(...args),
  };
});

describe("ios log consumer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("received sought JSON data with bad prefix", () => {
    it("should strip the bad prefix & parse properly ([)", () => {
      const promise = watchLogs();
      // @ts-expect-error mocked module
      const predicateResult = SpawnMock._callPredicate(
        "onData",
        Buffer.from(malformedTargetJsonData("["))
      );
      expect(predicateResult).toBe(true);
    });

    it("should strip the bad prefix & parse properly (,)", () => {
      const promise = watchLogs();
      // @ts-expect-error mocked module
      const predicateResult = SpawnMock._callPredicate(
        "onData",
        Buffer.from(malformedTargetJsonData(","))
      );
      expect(predicateResult).toBe(true);
    });
  });

  describe("received data we do not care for", () => {
    it("should ignore that event and not callback", () => {
      const promise = watchLogs();
      // @ts-expect-error mocked module
      const predicateResult = SpawnMock._callPredicate(
        "onData",
        Buffer.from(unsoughtJsonData)
      );
      expect(predicateResult).toBe(false);
    });
  });
});

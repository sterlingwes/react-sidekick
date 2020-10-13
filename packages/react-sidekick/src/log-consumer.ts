import { spawn, Predicate } from "./utils/spawn";

const prepJsonString = (jsonString: string) => {
  return jsonString.replace(/^[,\[]/, "").trim();
};

const renderNotice = "RENDERED!!";

const resolvePredicate: Predicate = (eventType, data) => {
  if (eventType !== "onData") return false;

  try {
    const json = JSON.parse(prepJsonString(data.toString()));
    if (json.eventMessage.includes(renderNotice)) {
      return true;
    }
  } catch (e) {
    // discard malformed
  }

  return false;
};

export const watchLogs = async () => {
  await spawn(
    [
      "xcrun",
      [
        "simctl",
        "spawn",
        "booted",
        "log",
        "stream",
        "--level",
        "info",
        "--color",
        "none",
        "--style",
        "json",
        "--predicate",
        'subsystem CONTAINS[c] "react"',
      ],
    ],
    { resolvePredicate }
  );
};

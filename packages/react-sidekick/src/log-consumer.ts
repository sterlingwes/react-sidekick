import { spawn, Predicate } from "./utils/spawn";

const prepJsonString = (jsonString: string) => {
  return jsonString.replace(/^[,\[]/, "").trim();
};

const renderNotice = "sidekick host: component rendered";
const jsError = "Unhandled JS Exception";

const resolvePredicate: Predicate<boolean> = (eventType, data) => {
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

const rejectPredicate: Predicate<Error | undefined> = (eventType, data) => {
  if (eventType !== "onData") return;

  try {
    const json = JSON.parse(prepJsonString(data.toString()));
    if (json.eventMessage.includes(jsError)) {
      const errorMessage = `Failed to render view in snapshot host:\n\n${json.eventMessage}`;
      return new Error(errorMessage);
    }
  } catch (e) {
    // discard malformed
  }
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
    { resolvePredicate, rejectPredicate }
  );
};

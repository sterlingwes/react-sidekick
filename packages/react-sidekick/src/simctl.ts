import { exec } from "./utils/exec";

const simctl = (subcommand: string) => `xcrun simctl ${subcommand}`;

const defaultBootOptions = {
  device: "iPod touch (7th generation)",
};

type BootOptions = {
  device: string;
};

export const boot = async (options: BootOptions = defaultBootOptions) => {
  const result = await exec(simctl(`bootstatus '${options.device}' -b`));
  if (/already booted/.test(result) || /Finished/.test(result)) {
    return;
  }

  throw new Error("Unable to boot device");
};

export const terminate = (bundleId: string) => {
  return exec(simctl(`terminate booted ${bundleId}`));
};

export const shutdown = () => {
  return exec(simctl(`shutdown booted`));
};

export const install = (bundlePath: string) => {
  return exec(simctl(`install booted ${bundlePath}`));
};

export const launch = (bundleId: string) => {
  return exec(simctl(`launch booted ${bundleId}`));
};

export const screenshot = async (filePath: string) => {
  try {
    await exec(simctl(`io booted screenshot --type png ${filePath}`));
  } catch (e) {
    if (typeof e === "string" && e.includes("Wrote screenshot")) {
      return;
    }

    throw e;
  }
};

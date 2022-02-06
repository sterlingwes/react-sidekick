const debug = process.env.DEBUG;
export const log = (...args: any[]) => {
  if (debug) console.log(...args);
};

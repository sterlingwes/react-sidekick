export const repeat = (str: string, times: number) =>
  Array.from(new Array(times)).reduce((acc) => acc + str, "");

export const tab = (times: number) => repeat("  ", times);

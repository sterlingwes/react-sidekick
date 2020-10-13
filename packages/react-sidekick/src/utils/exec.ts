import * as ChildProcess from "child_process";

const { exec: _exec } = ChildProcess;

const debugMode = !!process.env.DEBUG;

export const exec = (
  command: string,
  options?: ChildProcess.ExecOptions
): Promise<string> => {
  if (debugMode) console.log(`exec: ${command}`);
  return new Promise((resolve, reject) => {
    _exec(command, options, (error, stdout, stderr) => {
      if (error) return reject(error);
      const stderrMsg = stderr.toString();
      if (stderrMsg) return reject(stderrMsg);
      if (debugMode) console.log(`exec response: ${stdout.toString()}`);
      resolve(stdout.toString());
    });
  });
};

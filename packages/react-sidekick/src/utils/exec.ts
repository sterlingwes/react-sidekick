import * as ChildProcess from "child_process";
import { promises } from "fs";

const { exec: _exec, spawn: _spawn } = ChildProcess;

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

export const spawnWithLog = async (
  command: string,
  args: string[],
  logPath: string,
  options?: ChildProcess.SpawnOptions
): Promise<void> => {
  if (debugMode) console.log(`spawn: ${command} ${args.join(" ")}`);
  const file = await promises.open(logPath, "w");
  const child = options
    ? _spawn(command, args, options)
    : _spawn(command, args);
  return new Promise((resolve, reject) => {
    child.stdout?.on("data", (data) => file.appendFile(data));
    child.stderr?.on("data", (data) => file.appendFile(data));
    child.on("close", (code) => {
      file.appendFile(`Process exited with code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

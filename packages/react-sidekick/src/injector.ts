import { createReadStream, createWriteStream } from "fs";
import replaceStream from "replacestream";
import { exec } from "./utils/exec";
import { paths } from "./utils/paths";

const replacementTemplate = (injectedValue: string) =>
  `Placeholder=function(){return ${injectedValue}}`;
const replacementTarget = replacementTemplate("null");

const readFile = paths.bundlePath;
const writeFile = `${paths.appBundlePath}/main.jsbundle.tmp`;

const replace = (replacementValue: string) => {
  return new Promise((resolve) => {
    const to = createWriteStream(writeFile);
    createReadStream(readFile)
      .pipe(
        replaceStream(replacementTarget, replacementTemplate(replacementValue))
      )
      .pipe(to)
      .on("finish", async () => {
        await exec(`mv ${writeFile} ${readFile}`);
        resolve();
      });
  });
};

const reset = () => {
  return exec(`cp ${paths.backupPath} ${paths.bundlePath}`);
};

export const inject = async (jsString: string) => {
  await reset();
  await replace(jsString);
};

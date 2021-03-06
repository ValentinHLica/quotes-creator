import { writeFileSync } from "fs";
import { join } from "path";
import cluster from "cluster";

import { tempPath } from "../config/paths";

import { getContent, spreadWork } from "../utils/helper";
import { addAudioFilter } from "./lib";

export default async () => {
  return new Promise(async (resolve) => {
    const { quotes } = getContent();

    const work = spreadWork([
      ...quotes.map((quote) => quote.index),
      "intro",
      "outro",
    ]);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempPath, "data", `${index}-audio.json`);

      writeFileSync(jobsFilePath, JSON.stringify(jobs));

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [jobsFilePath],
      });

      const worker = cluster.fork();

      worker.on("exit", () => {
        counter--;

        if (counter === 0) {
          addAudioFilter();

          resolve(null);
        }
      });
    }
  });
};

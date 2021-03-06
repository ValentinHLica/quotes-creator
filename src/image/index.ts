import { writeFileSync } from "fs";
import { join } from "path";
import cluster from "cluster";

import { tempPath } from "../config/paths";

import { getContent, spreadWork } from "../utils/helper";
import {
  createBackgroundImage,
  createIntroImage,
  createOutroImage,
} from "./lib";

export default async () => {
  return new Promise(async (resolve) => {
    await createBackgroundImage();

    await createIntroImage();

    await createOutroImage();

    const {
      quotes,
      details: { author, occupation },
    } = getContent();

    const work = spreadWork(quotes);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempPath, "data", `${index}-quotes.json`);

      writeFileSync(
        jobsFilePath,
        JSON.stringify({
          quotes: jobs,
          author,
          occupation,
        })
      );

      cluster.setupPrimary({
        exec: join(__dirname, "worker.js"),
        args: [jobsFilePath],
      });

      const worker = cluster.fork();

      worker.on("exit", () => {
        counter--;

        if (counter === 0) {
          resolve(null);
        }
      });
    }
  });
};

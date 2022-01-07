import cluster from "cluster";
import { join } from "path";
import { existsSync, writeFileSync } from "fs";

import { renderPath, tempPath } from "../config/paths";

import { getContent, getFolders, spreadWork } from "../utils/helper";
import { mergeVideos } from "./lib";

const generateQuoteVideo = async () => {
  return new Promise((resolve) => {
    const folders = getFolders(renderPath).filter((e) => {
      const audioPath = join(renderPath, e, "audio.wav");
      const imagePath = join(renderPath, e, "image.png");

      if (existsSync(audioPath) && existsSync(imagePath)) {
        return e;
      }
    });

    const work = spreadWork(folders);
    let counter = work.length;

    for (let index = 0; index < work.length; index++) {
      const jobs = work[index];

      const jobsFilePath = join(tempPath, "data", `${index}-video.json`);

      writeFileSync(jobsFilePath, JSON.stringify(jobs));

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

const mergeQuotes = async () => {
  const { exportPath } = getContent();
  const folders = getFolders(renderPath);

  const listPath = join(renderPath, "list.txt");

  const videos = folders
    .filter((folder) => {
      return existsSync(join(renderPath, folder, "video.mp4"));
    })
    .map((folder) => `file '${join(renderPath, folder, "video.mp4")}'`);

  writeFileSync(listPath, videos.join(" \n"));

  mergeVideos({ listPath, exportPath });
};

export default async () => {
  // Generate video for each comment
  await generateQuoteVideo();

  // Merge Videos
  await mergeQuotes();
};

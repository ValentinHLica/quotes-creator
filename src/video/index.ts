import cluster from "cluster";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import {
  audioPath,
  imagePath,
  renderPath,
  tempPath,
  videoPath,
} from "../config/paths";

import {
  getContent,
  createRandomString,
  spreadWork,
  generateTitle,
} from "../utils/helper";
import { mergeFiles } from "./lib";
import { addBackgroundMusic } from "../audio/lib";

const generateQuoteVideo = async () => {
  return new Promise((resolve) => {
    const { quotes } = getContent();

    const quotesList = [
      ...quotes
        .filter((e) => {
          if (
            existsSync(audioPath(e.index)) &&
            existsSync(imagePath(e.index))
          ) {
            return e;
          }
        })
        .map((e) => e.index),
      "intro",
      "outro",
    ];

    const work = spreadWork(quotesList);
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
  const { quotes } = getContent();

  const listPath = join(renderPath, "list.txt");

  const videos = quotes
    .filter(({ index }) => existsSync(videoPath(index)))
    .map(({ index }) => `file '${videoPath(index)}'`);

  writeFileSync(
    listPath,
    [
      `file '${videoPath("intro")}'`,
      ...videos,
      `file '${videoPath("outro")}'`,
    ].join(" \n")
  );

  mergeFiles({ listPath, exportPath: renderPath });
};

export default async () => {
  const {
    exportPath,
    assets,
    details: { author },
  } = getContent();

  // Generate video for each comment
  await generateQuoteVideo();

  // Merge Videos
  await mergeQuotes();

  const outputPath = join(exportPath, createRandomString(2));

  mkdirSync(outputPath);

  const titleFile = join(outputPath, "title.txt");

  writeFileSync(titleFile, generateTitle(author));

  addBackgroundMusic({
    videoPath: join(renderPath, "video.mp4"),
    audioPath: assets.audio,
    outputPath: outputPath,
  });
};

import cluster from "cluster";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import { renderPath, tempPath } from "../config/paths";

import {
  getContent,
  getDuration,
  createRandomString,
  spreadWork,
  generateTitle,
} from "../utils/helper";
import { addBackgroundMusic, generateVideo, mergeFiles } from "./lib";

const createOutro = async () => {
  const id = "outro";

  const imagePath = join(renderPath, `${id}-image.png`);

  const audioPath = join(renderPath, `${id}-text.wav`);

  const duration = getDuration(audioPath);

  generateVideo({
    exportPath: renderPath,
    image: imagePath,
    audio: audioPath,
    title: "outro",
    duration,
  });
};

const generateQuoteVideo = async () => {
  return new Promise((resolve) => {
    const { quotes } = getContent();

    const quotesList = quotes.filter((e) => {
      const audioPath = join(renderPath, `${e.id}-audio.wav`);
      const imagePath = join(renderPath, `${e.id}-image.png`);

      if (existsSync(audioPath) && existsSync(imagePath)) {
        return e;
      }
    });

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
    .filter((quote) => {
      return existsSync(join(renderPath, `${quote.id}-video.mp4`));
    })
    .map((quote) => `file '${join(renderPath, `${quote.id}-video.mp4`)}'`)
    .concat(`file '${join(renderPath, "outro.mp4")}'`);

  writeFileSync(listPath, videos.join(" \n"));

  mergeFiles({ listPath, exportPath: renderPath });
};

export default async () => {
  const { exportPath, assets, quotes } = getContent();

  // Generate video for each comment
  await generateQuoteVideo();

  // Create Outro
  await createOutro();

  // Merge Videos
  await mergeQuotes();

  const outputPath = join(exportPath, createRandomString(2));

  mkdirSync(outputPath);

  const titleFile = join(outputPath, "title.txt");

  writeFileSync(titleFile, generateTitle(quotes[0]));

  addBackgroundMusic({
    videoPath: join(renderPath, "video.mp4"),
    audioPath: assets.audio,
    outputPath: outputPath,
  });
};

import cluster from "cluster";
import { join } from "path";
import { existsSync, writeFileSync } from "fs";

import { renderPath, tempPath } from "../config/paths";

import { generateAudioFile } from "../audio/lib";
import { createOutroImage } from "../image/lib";
import {
  getContent,
  getDuration,
  getFolders,
  spreadWork,
} from "../utils/helper";
import { addBackgroundMusic, generateVideo, mergeFiles } from "./lib";

const createOutro = async () => {
  const id = "outro";

  const imagePath = join(renderPath, `${id}-image.png`);
  const textFilePath = join(renderPath, `${id}-text.txt`);

  await createOutroImage();

  generateAudioFile({
    exportPath: renderPath,
    textFilePath,
    id: "outro",
  });

  const duration = getDuration(join(renderPath, `${id}-subtitle.srt`));

  generateVideo({
    exportPath: renderPath,
    image: imagePath,
    audio: join(renderPath, `${id}-audio.wav`),
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
  const { exportPath, assets } = getContent();

  // Generate video for each comment
  await generateQuoteVideo();

  // Create Outro
  await createOutro();

  // Merge Videos
  await mergeQuotes();

  addBackgroundMusic({
    videoPath: join(renderPath, "video.mp4"),
    audioPath: assets.audio,
    outputPath: exportPath,
  });
};

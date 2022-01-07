import cluster from "cluster";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import Jimp from "jimp";

import { assetsPath, renderPath, tempPath } from "../config/paths";
import { resolution } from "../config/image";

import { getVoice, generateAudioFile } from "../audio/lib";
import { createOutroImage } from "../image/lib";
import {
  getContent,
  getDuration,
  getFolders,
  spreadWork,
} from "../utils/helper";
import { addBackgroundMusic, generateVideo, mergeFiles } from "./lib";

const createOutro = async () => {
  const outroPath = join(renderPath, "outro");
  const imagePath = join(outroPath, "image.png");
  const textFilePath = join(outroPath, "text.txt");

  await createOutroImage();

  const voice = getVoice();

  generateAudioFile({
    voice,
    exportPath: outroPath,
    textFilePath,
  });

  const duration = getDuration(join(outroPath, "subtitle.srt"));

  generateVideo({
    exportPath: outroPath,
    image: imagePath,
    audio: join(outroPath, "audio.wav"),
    title: "outro",
    duration,
  });
};

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
  const outroPath = join(renderPath, "outro");
  const folders = getFolders(renderPath);

  const listPath = join(renderPath, "list.txt");

  const videos = folders
    .filter((folder) => {
      return existsSync(join(renderPath, folder, "video.mp4"));
    })
    .map((folder) => `file '${join(renderPath, folder, "video.mp4")}'`)
    .concat(`file '${join(outroPath, "outro.mp4")}'`);

  writeFileSync(listPath, videos.join(" \n"));

  mergeFiles({ listPath, exportPath: renderPath });
};

export default async () => {
  const { exportPath } = getContent();

  // Generate video for each comment
  await generateQuoteVideo();

  // Create Outro
  await createOutro();

  // Merge Videos
  await mergeQuotes();

  addBackgroundMusic({
    videoPath: join(renderPath, "video.mp4"),
    audioPath: join(exportPath, "audio.mp3"),
    outputPath: exportPath,
  });
};

import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { getDuration } from "../utils/helper";

import { generateVideo } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const quotes = JSON.parse(readFileSync(args[0]).toString()) as {
    quote: string;
    index: number;
  }[];

  for (const quote of quotes) {
    const audioPath = join(renderPath, `${quote.index}-audio.wav`);
    const audioDuration = getDuration(audioPath);

    if (audioDuration) {
      generateVideo({
        image: join(renderPath, `${quote.index}-image.png`),
        audio: audioPath,
        exportPath: renderPath,
        duration: audioDuration,
        title: `${quote.index}-video`,
      });
    }

    console.log("video-generated");
  }

  // Kill Worker
  process.exit();
};

init();

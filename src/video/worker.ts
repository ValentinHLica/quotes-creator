import { readFileSync } from "fs";
import { Quote } from "interface/content";
import { join } from "path";

import { renderPath } from "../config/paths";
import { getDuration } from "../utils/helper";

import { generateVideo } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const quotes = JSON.parse(readFileSync(args[0]).toString()) as Quote[];

  for (const quote of quotes) {
    const audioDuration = getDuration(
      join(renderPath, `${quote.id}-subtitle.srt`)
    );

    if (audioDuration) {
      generateVideo({
        image: join(renderPath, `${quote.id}-image.png`),
        audio: join(renderPath, `${quote.id}-audio.wav`),
        exportPath: renderPath,
        duration: audioDuration + 1,
        title: `${quote.id}-video`,
      });
    }

    console.log("video-generated");
  }

  // Kill Worker
  process.exit();
};

init();

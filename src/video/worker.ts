import { readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { getDuration } from "../utils/helper";

import { generateVideo } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const folders = JSON.parse(readFileSync(args[0]).toString()) as string[];

  for (const folder of folders) {
    const exportPath = join(renderPath, folder);
    const audioDuration = getDuration(join(exportPath, "subtitle.srt"));

    if (audioDuration) {
      generateVideo({
        image: join(exportPath, "image.png"),
        audio: join(exportPath, "audio.wav"),
        exportPath,
        duration: audioDuration + 1,
      });
    }

    console.log("video-generated");
  }

  // Kill Worker
  process.exit();
};

init();

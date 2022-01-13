import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

import { getArgument, getContent } from "../utils/helper";

export const addAudioFilter = () => {
  const { quotes } = getContent();

  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  quotes.forEach((e) => {
    const audioPath = join(renderPath, `${e.id}-text.wav`);
    const imagePath = join(renderPath, `${e.id}-image.png`);
    const outputPath = join(renderPath, `${e.id}-audio.wav`);

    if (existsSync(audioPath) && existsSync(imagePath)) {
      try {
        execSync(
          `${ffmpeg} -i ${audioPath} -af "apad=pad_dur=1,atempo=0.85" ${outputPath}`,
          { stdio: "pipe" }
        );
      } catch (error) {}
    }
  });
};

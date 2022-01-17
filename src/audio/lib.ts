import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";

import { getArgument, getContent } from "../utils/helper";

export const addAudioFilter = () => {
  const { quotes } = getContent();

  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  quotes.forEach((_, index) => {
    const audioPath = join(renderPath, `${index}-text.wav`);
    const imagePath = join(renderPath, `${index}-image.png`);
    const outputPath = join(renderPath, `${index}-audio.wav`);

    if (existsSync(audioPath) && existsSync(imagePath)) {
      try {
        execSync(
          `${ffmpeg} -i ${audioPath} -af "apad=pad_dur=1.3" ${outputPath}`,
          { stdio: "pipe" }
        );
      } catch (error) {}
    }
  });
};

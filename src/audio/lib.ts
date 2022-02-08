import { execSync } from "child_process";
import { existsSync, rename, renameSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

import {
  audioPath,
  renderPath,
  textPath,
  imagePath,
  audioEditPath,
} from "../config/paths";

import { mergeFiles } from "../video/lib";
import { getContent, getDuration } from "../utils/helper";

/**
 * Generate Audio from text
 */
export const generateAudioFile = (id: string | number) => {
  const command = `bal4web -s m -l en-Us -n ChristopherNeural -f "${textPath(
    id
  )}" -w "${audioPath(id)}"`;

  try {
    execSync(command);
  } catch (error) {
    console.log(error);
  }

  console.log("audio-generated");
};

export const addAudioFilter = () => {
  const { quotes } = getContent();

  quotes.forEach(({ index }) => {
    if (existsSync(audioPath(index)) && existsSync(imagePath(index))) {
      try {
        execSync(
          `ffmpeg -i ${audioPath(index)} -af "apad=pad_dur=1.3" ${audioEditPath(
            index
          )}`,
          { stdio: "pipe" }
        );
      } catch (error) {}

      unlinkSync(audioPath(index));

      renameSync(audioEditPath(index), audioPath(index));
    }
  });
};

type AddBackgroundMusic = (args: {
  videoPath: string;
  audioPath: string;
  outputPath: string;
}) => void;

export const addBackgroundMusic: AddBackgroundMusic = async ({
  videoPath,
  audioPath,
  outputPath,
}) => {
  const videoDuration = getDuration(videoPath);

  const musicDuration = getDuration(audioPath);

  if (videoDuration > musicDuration) {
    const audioFiles = [];

    for (let i = 0; i < Math.ceil(videoDuration / musicDuration); i++) {
      audioFiles.push(`file '${audioPath}'`);
    }

    const listPath = join(renderPath, "music-list.txt");

    writeFileSync(listPath, audioFiles.join("\n"));

    mergeFiles({
      exportPath: renderPath,
      listPath: listPath,
      video: false,
      title: "music",
    });
  }

  const exportPath = join(outputPath, "video.mp4");
  const backgroundMusicPath = join(renderPath, "music.wav");

  const command = `ffmpeg -y -i "${videoPath}" -i "${
    videoDuration > musicDuration ? backgroundMusicPath : audioPath
  }" -filter_complex "[1:a]volume=0.04[b];[0:a][b]amerge=inputs=2[a]" -map 0:v -map [a] -c:v copy -ac 2 -t ${videoDuration} "${exportPath}"`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    console.log(error);
  }

  console.log("background-audio-generated");
};

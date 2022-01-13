import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { getArgument } from "../utils/helper";

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
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const audioFiles = [];
  for (let i = 0; i < 20; i++) {
    audioFiles.push(`file '${audioPath}'`);
  }

  const audioListPath = join(renderPath, "audio-list.txt");

  writeFileSync(audioListPath, audioFiles.join("\n"));

  const backgroundAudioPath = join(renderPath, "background-music.wav");

  mergeFiles({
    exportPath: renderPath,
    listPath: audioListPath,
    video: false,
    title: "music",
  });

  const audioOutputPath = join(renderPath, "music.wav");

  const audioCommand = `${ffmpeg} -i ${audioOutputPath} -filter:a volume=0.05 ${backgroundAudioPath}`;

  try {
    execSync(audioCommand, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }

  const exportPath = join(outputPath, "video.mp4");

  const command = `${ffmpeg} -y -i ${videoPath} -i ${backgroundAudioPath} -filter_complex "[0:a][1:a]amerge=inputs=2[a]" -map 0:v -map [a] -c:v copy -ac 2 -shortest ${exportPath}`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }
};

type GenerateVideo = (args: {
  image: string;
  audio?: string;
  exportPath: string;
  title?: string;
  duration: string;
}) => void;

/**
 * Generate Video from frame data
 * @param renderDataPath Text file with frames data
 * @param outputPath Video Output path
 */
export const generateVideo: GenerateVideo = ({
  image,
  audio,
  exportPath,
  title,
  duration,
}) => {
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const outputPath = join(exportPath, `${title ?? "video"}.mp4`);

  const command = `${ffmpeg} -loop 1 -framerate 5 -i "${image}" -i "${audio}" -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p -c:v libx264 -t ${duration} ${outputPath}`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }
};

type MergeFiles = (args: {
  listPath: string;
  exportPath: string;
  title?: string;
  video?: boolean;
}) => void;

/**
 * Merge Videos together
 */
export const mergeFiles: MergeFiles = ({
  listPath,
  exportPath,
  title,
  video = true,
}) => {
  const ffmpeg = getArgument("FFMPEG") ?? "ffmpeg";

  const outputPath = join(
    exportPath,
    `${title ?? "video"}.${video ? "mp4" : "wav"}`
  );

  const args = `${ffmpeg} -safe 0 -f concat -i ${listPath} -c copy ${outputPath}`;

  try {
    execSync(args, { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }
};

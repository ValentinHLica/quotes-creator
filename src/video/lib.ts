import { execSync } from "child_process";
import { join } from "path";

import { audioPath, imagePath, videoPath } from "../config/paths";
import { getDuration } from "../utils/helper";

/**
 * Generate Video from frame data
 * @param renderDataPath Text file with frames data
 * @param outputPath Video Output path
 */
export const generateVideo = (id: string | number) => {
  const duration = getDuration(audioPath(id));

  try {
    execSync(
      `ffmpeg -loop 1 -framerate 5 -i "${imagePath(id)}" -i "${audioPath(
        id
      )}" -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p -c:v libx264 -t ${duration} ${videoPath(
        id
      )}`,
      { stdio: "pipe" }
    );
  } catch (error) {
    // console.log(error);
  }

  console.log("video-generated");
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
  const outputPath = join(
    exportPath,
    `${title ?? "video"}.${video ? "mp4" : "wav"}`
  );

  try {
    execSync(`ffmpeg -safe 0 -f concat -i ${listPath} -c copy ${outputPath}`, {
      stdio: "pipe",
    });
  } catch (error) {
    // console.log(error);
  }
};

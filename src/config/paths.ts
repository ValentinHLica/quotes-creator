import { tmpdir } from "os";
import { join } from "path";

export const tempPath = join(tmpdir(), "daily-quotes");
export const renderPath = join(tempPath, "render");
export const dataPath = join(tempPath, "data");
export const assetsPath = join(__dirname, "..", "assets");
export const fontPath = join(assetsPath, "font");

type FileId = (id: string | number) => string;

export const imagePath: FileId = (id) => join(renderPath, `${id}-image.png`);
export const textPath: FileId = (id) => join(renderPath, `${id}-text.txt`);
export const audioPath: FileId = (id) => join(renderPath, `${id}-audio.wav`);
export const audioEditPath: FileId = (id) =>
  join(renderPath, `${id}-edit-audio.wav`);
export const videoPath: FileId = (id) => join(renderPath, `${id}-video.mp4`);

import { cpus } from "os";
import { execSync } from "child_process";
import {
  mkdirSync,
  existsSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  lstatSync,
  readFileSync,
} from "fs";
import { join } from "path";

import { dataPath, renderPath, tempPath } from "../config/paths";
import { Arguments } from "../interface/utils";
import { Content } from "../interface/content";

/**
 * Create Random String
 */
export const createRandomString = (size: number) =>
  (Math.random() + 1).toString(36).substring(size || 7);

/**
 * List all files and folders inside folder
 * @param path Folder path
 * @returns List of files and folders inside folder
 */
export const getFolders = (path: string | null): string[] => {
  const files: string[] = readdirSync(path) ?? [];

  const filesList: string[] = [];

  for (const file of files) {
    const index = parseInt(file.split("-")[0], 10);
    filesList[index] = file;
  }

  return filesList.filter((item) => !item.includes(".json"));
};

/**
 * Delete Folder with its contents
 */
export const deleteFolder = (path: string) => {
  if (existsSync(path)) {
    readdirSync(path).forEach((file: string) => {
      const curPath = join(path, file);
      if (lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        unlinkSync(curPath);
      }
    });
    rmdirSync(path);
  }
};

/**
 * Reset Temp folder for new process
 */
export const resetTemp = async () => {
  deleteFolder(tempPath);

  mkdirSync(tempPath);
  mkdirSync(dataPath);
  mkdirSync(renderPath);
};

/**
 * Get Argument value
 */
export const getArgument = (key: Arguments) => {
  let value: string | null = null;

  const args = process.argv
    .filter((arg) => arg.split("=").length > 1)
    .map((arg) => arg.split("="));

  for (const argument of args) {
    if (argument[0] === key) {
      value = argument[1];
      break;
    }
  }

  return value;
};

/**
 * Get Aspect Ratio for images
 */
export const getAspectRatio = async (width: number, height: number) => {
  return height == 0 ? width : getAspectRatio(height, width % height);
};

/**
 * Slugify post title to file
 */
export const slugify = (title: string) => {
  const illegalLetter = [
    "\\",
    "/",
    ":",
    "*",
    "?",
    '"',
    "<",
    ">",
    "|",
    ".",
    ",",
  ];

  for (const letter of illegalLetter) {
    title = title.split(letter).join("");
  }

  return title;
};

/**
 * Get Subtitle duration
 */
export const getDuration = (audioPath: string) => {
  const ffprobe = getArgument("FFPROBE") ?? "ffprobe";

  const args = `${ffprobe} -i "${audioPath}" -show_entries format=duration -v quiet -of csv="p=0"`;

  try {
    return execSync(args, { stdio: "pipe" }).toString().trim();
  } catch (error) {
    // console.log(error);
  }
};

/**
 * Get Post data
 */
export const getContent = () =>
  JSON.parse(readFileSync(getArgument("CONTENT")).toString()) as Content;

/**
 * Spread work count for each cluster
 * @param work Array of any items
 */
export const spreadWork = <T extends unknown>(work: T[]): T[][] => {
  const cpuCount = cpus().length;
  const workPerCpu = Math.floor(work.length / cpuCount);
  let leftWork = work.length % cpuCount;
  const workSpreed: T[][] = [];
  let counter = 0;

  for (let i = 0; i < cpuCount; i++) {
    const increment = i < leftWork ? workPerCpu + 1 : workPerCpu;
    workSpreed[i] = work.slice(counter, counter + increment);
    counter += increment;
  }

  return workSpreed;
};

export const generateTitle = (author: string): string => {
  const words = [
    "The Best Quotes by {author}",
    "The Most Powerful Quotes by {author}",
    "Thoughtful {author} Quotes",
    "The Wisest {author} Quotes",
    "Wise Quotes by {author}",
    "Quotes by {author}",
    "Inspirational {author} Quotes",
    "{author}'s Excellent Quotes",
    "{author}'s Best Quotes",
    "{author}'s Most Powerful Quotes",
    "{author}'s Wisest Quotes",
    "{author}'s Quotes",
  ];

  const randomTitle = Math.floor(Math.random() * words.length);

  return words[randomTitle].replace("{author}", author);
};

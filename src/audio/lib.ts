import { execSync } from "child_process";
import { join } from "path";

import { getArgument } from "../utils/helper";

/**
 * Get Voices List
 * @returns List of voices
 */
export const getVoice = () => {
  const balcon = getArgument("BALCON") ?? "balcon";

  const selectedVoice = getArgument("VOICE");

  if (selectedVoice) {
    return selectedVoice;
  }

  try {
    const args = [balcon, "-l"];

    const voices = execSync(args.join(" ")).toString();

    const listOfVoice = voices
      .trim()
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v !== "SAPI 5:");

    return listOfVoice[0];
  } catch (error) {
    // console.log(error);
  }

  return null;
};

type GenerateAudioFile = (args: {
  textFilePath: string;
  exportPath: string;
  voice?: string;
}) => void;

/**
 * Generate Audio from text
 */
export const generateAudioFile: GenerateAudioFile = ({
  textFilePath,
  exportPath,
  voice,
}) => {
  let selectedVoice = voice ?? getVoice();

  const balcon = getArgument("BALCON") ?? "balcon";

  const args = [
    balcon,
    "-f",
    `"${textFilePath}"`,
    "-w",
    `"${join(exportPath, "audio.wav")}"`,
    "-n",
    selectedVoice,
    "-s",
    "-3",
    "--lrc-length",
    "400",
    "--srt-length",
    "400",
    "-srt",
    "--srt-enc",
    "utf8",
    "--srt-fname",
    `"${join(exportPath, "subtitle.srt")}"`,
    "--ignore-url",
    "--silence-begin",
    "400",
    "--silence-end",
    "1000",
  ];

  try {
    execSync(args.join(" "), { stdio: "pipe" });
  } catch (error) {
    // console.log(error);
  }
};

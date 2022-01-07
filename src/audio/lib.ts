import { execFileSync } from "child_process";
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

  const voices = execFileSync(balcon, ["-l"]).toString();

  const listOfVoice = voices
    .trim()
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v !== "SAPI 5:");

  return listOfVoice[0];
};

/**
 * Generate Audio from text
 */
export const generateAudioFile = ({ textFilePath, exportPath, voice }) => {
  let selectedVoice = voice ?? getVoice();

  const balcon = getArgument("BALCON") ?? "balcon";

  const args = [
    "-f",
    textFilePath,
    "-w",
    `${join(exportPath, "audio.wav")}`,
    "-n",
    selectedVoice,
    "--lrc-length",
    "400",
    "--srt-length",
    "400",
    "-srt",
    "--srt-enc",
    "utf8",
    "--srt-fname",
    `${join(exportPath, "subtitle.srt")}`,
    "--ignore-url",
    "--silence-end",
    "1000",
  ];

  try {
    execFileSync(balcon, args);
  } catch (error) {
    // console.log(error);
  }
};

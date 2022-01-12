import { execSync } from "child_process";
import { join } from "path";

import { getArgument, timeOut } from "../utils/helper";

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
    const voices = execSync(`${balcon} -l`).toString();

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
export const generateAudioFile: GenerateAudioFile = async ({
  textFilePath,
  exportPath,
  voice,
}) => {
  let selectedVoice = voice ?? getVoice();

  const balcon = getArgument("BALCON") ?? "balcon";

  const audioPath = join(exportPath, "audio.wav");
  const subtitlePath = join(exportPath, "subtitle.srt");

  const command = `${balcon} -f "${textFilePath}" -w "${audioPath}" -n ${selectedVoice} -s -3 --lrc-length 400 --srt-length 400 -srt --srt-enc utf8 --srt-fname "${subtitlePath}" --ignore-url --silence-begin 400 --silence-end 1000"`;

  // const command = `bal4web -s a -l en-US -g m -n Matthew -f "${textFilePath}" -w "${audioPath}" --lrc-length 400 --srt-length 400 -srt --srt-enc utf8 --srt-fname "${subtitlePath}" --ignore-url`;

  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    await timeOut(() => {
      execSync(command, { stdio: "pipe" });
    }, 30 * 60);

    // console.log(error);
  }
};

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath, tempPath } from "../config/paths";
import { Quote } from "../interface/content";

import { generateAudioFile } from "./lib";

const init = async () => {
  const data = JSON.parse(process.argv.slice(2)[0]) as {
    quotesPath: string;
    voice: string;
  };

  const quotes = JSON.parse(
    readFileSync(data.quotesPath).toString()
  ) as Quote[];

  for (const quote of quotes) {
    const exportPath = join(renderPath, quote.id + "");
    const textFilePath = join(exportPath, "text.txt");

    writeFileSync(textFilePath, quote.text);

    generateAudioFile({
      exportPath,
      textFilePath,
      voice: data.voice,
    });

    console.log("audio-generated");
  }

  // Kill Worker
  process.exit();
};

init();

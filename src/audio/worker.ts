import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { renderPath, tempPath } from "../config/paths";
import { Quote } from "../interface/content";

import { generateAudioFile } from "./lib";

const init = async () => {
  const { quotesPath, voice } = JSON.parse(process.argv.slice(2)[0]) as {
    quotesPath: string;
    voice: string;
  };

  const quotes = JSON.parse(readFileSync(quotesPath).toString()) as Quote[];

  for (const quote of quotes) {
    const textFilePath = join(renderPath, `${quote.id}-text.txt`);

    writeFileSync(textFilePath, quote.text);

    generateAudioFile({
      exportPath: renderPath,
      textFilePath,
      voice,
      id: quote.id,
    });

    console.log("audio-generated");
  }

  // Kill Worker
  process.exit();
};

init();

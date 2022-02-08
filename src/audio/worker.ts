import { readFileSync } from "fs";

import { generateAudioFile } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const quotes = JSON.parse(readFileSync(args[0]).toString()) as number[];

  for (const quoteIndex of quotes) {
    generateAudioFile(quoteIndex);
  }

  // Kill Worker
  process.exit();
};

init();

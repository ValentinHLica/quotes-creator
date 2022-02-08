import { readFileSync } from "fs";

import { generateVideo } from "./lib";

const init = async () => {
  const args = process.argv.slice(2);
  const items = JSON.parse(readFileSync(args[0]).toString()) as (
    | string
    | number
  )[];

  for (const itemIndex of items) {
    generateVideo(itemIndex);
  }

  // Kill Worker
  process.exit();
};

init();

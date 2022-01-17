import { readFileSync } from "fs";

import { createQuotes } from "./lib";

const init = async () => {
  const { quotes, author, occupation } = JSON.parse(
    readFileSync(process.argv.slice(2)[0]).toString()
  ) as {
    quotes: string[];
    author: string;
    occupation: string;
  };

  await createQuotes({ quotes, author, occupation });

  // Kill Worker
  process.exit();
};

init();

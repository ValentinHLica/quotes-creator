import { readFileSync } from "fs";

import { Quote } from "../interface/content";

import { createQuotes } from "./lib";

const init = async () => {
  const { quotes } = JSON.parse(
    readFileSync(process.argv.slice(2)[0]).toString()
  ) as {
    quotes: Quote[];
  };

  await createQuotes(quotes);

  // Kill Worker
  process.exit();
};

init();

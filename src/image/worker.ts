import { readFileSync } from "fs";

import { Quote, QuoteAssets } from "../interface/content";

import { createBackgroundImage, createQuotes } from "./lib";

const init = async () => {
  const { quotes, assets } = JSON.parse(
    readFileSync(process.argv.slice(2)[0]).toString()
  ) as {
    quotes: Quote[];
    assets: QuoteAssets;
  };

  await createBackgroundImage(assets);

  await createQuotes(quotes);

  // Kill Worker
  process.exit();
};

init();

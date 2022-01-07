import { mkdir, mkdirSync, readFileSync } from "fs";
import { join } from "path";

import { renderPath } from "../config/paths";
import { Quote, QuoteAssets } from "../interface/content";

import { createQuote } from "./lib";

const init = async () => {
  const data = JSON.parse(
    readFileSync(process.argv.slice(2)[0]).toString()
  ) as {
    quotes: Quote[];
    assets: QuoteAssets;
  };

  for (const quote of data.quotes) {
    mkdirSync(join(renderPath, quote.id + ""));

    const exportPath = join(renderPath, quote.id + "", "image.png");

    await createQuote({
      quote,
      assets: data.assets,
      exportPath,
    });

    console.log("image-generated");
  }

  // Kill Worker
  process.exit();
};

init();

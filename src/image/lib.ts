import { join } from "path";
import { readdirSync } from "fs";

import Jimp from "jimp";

import { assetsPath } from "../config/paths";
import { resolution } from "../config/image";
import { Quote, QuoteAssets } from "../interface/content";

type CreateQuote = (args: {
  quote: Quote;
  assets: QuoteAssets;
  exportPath: string;
}) => Promise<void>;

export const createQuote: CreateQuote = async ({
  quote,
  assets,
  exportPath,
}) => {
  try {
    const { width, height } = resolution;

    // Create image instance
    const image = new Jimp(width, height, "#000000");

    // Add Background
    if (assets.background) {
      const backgroundImage = await Jimp.read(assets.background);

      if (backgroundImage.getWidth() < backgroundImage.getHeight()) {
        backgroundImage.flip(true, false);
      }

      backgroundImage.cover(width, height);

      image.composite(backgroundImage, 0, 0);
    }

    // Add Author Image
    const authorImage = await Jimp.read(assets.avatar);

    authorImage.resize(Jimp.AUTO, height - 100);

    image.composite(authorImage, width - authorImage.getWidth(), 100);

    // Print Quote and details
    const quoteMaxWidth = width / 1.7;
    const fonts = readdirSync(join(assetsPath, "font")).filter((e) =>
      e.endsWith(".fnt")
    );

    const maxQuoteHeight = height - 200;
    const maxQuoteWidth = quoteMaxWidth;
    let quoteFont = null;
    let quoteHeight = 0;

    for (const font of fonts) {
      const titleFont = await Jimp.loadFont(join(assetsPath, "font", font));

      const textHeight = Jimp.measureTextHeight(
        titleFont,
        quote.text,
        maxQuoteWidth
      );

      if (textHeight < maxQuoteHeight && textHeight > quoteHeight) {
        quoteFont = titleFont;
        quoteHeight = textHeight;
      }
    }

    const quoteImage = new Jimp(quoteMaxWidth, quoteHeight);
    quoteImage.print(
      quoteFont,
      0,
      0,
      {
        text: quote.text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      quoteImage.getWidth()
    );
    quoteImage.color([{ apply: "xor", params: ["#ffffff"] }]);

    let detailsImage: Jimp | null = null;
    let detailsTotalHeight: number = 0;

    if (quote.author || quote.description) {
      const detailsFont = await Jimp.loadFont(
        join(assetsPath, "font", "40.fnt")
      );

      const authorTextHeight: number = quote.author
        ? Jimp.measureTextHeight(detailsFont, quote.author, quoteMaxWidth)
        : 0;

      const descriptionTextHeight: number = quote.description
        ? Jimp.measureTextHeight(detailsFont, quote.description, quoteMaxWidth)
        : 0;

      const totalHeight = authorTextHeight + descriptionTextHeight;

      if (totalHeight > 0) {
        detailsTotalHeight = totalHeight;

        detailsImage = new Jimp(quoteMaxWidth, totalHeight);

        if (quote.author) {
          detailsImage.print(
            detailsFont,
            0,
            0,
            {
              text: quote.author,
              alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
              alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            quoteMaxWidth
          );
        }

        if (quote.description) {
          detailsImage.print(
            detailsFont,
            0,
            authorTextHeight,
            {
              text: quote.description,
              alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
              alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            quoteMaxWidth
          );
        }

        detailsImage.color([{ apply: "xor", params: ["#ffffff"] }]);
      }
    }

    image.composite(
      quoteImage,
      0,
      height / 2 - quoteHeight / 2 - detailsTotalHeight / 2
    );

    if (detailsImage) {
      image.composite(detailsImage, 0, height / 2 + quoteHeight / 2);
    }

    await image.writeAsync(exportPath);
  } catch (error) {
    console.log(error);
  }
};

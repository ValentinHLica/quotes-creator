import { join } from "path";
import { mkdirSync, readdirSync, writeFileSync } from "fs";

import Jimp from "jimp";

import { assetsPath, renderPath } from "../config/paths";
import { resolution } from "../config/image";
import { Quote, QuoteAssets } from "../interface/content";

import { getContent } from "../utils/helper";

export const createBackgroundImage = async (assets: QuoteAssets) => {
  const { width, height } = resolution;

  const quoteMaxWidth = width / 1.7 + 80;

  // Check Requirements
  const requirements = [
    {
      value: assets.background,
      name: "Background Image",
    },
    {
      value: assets.avatar,
      name: "Avatar Image",
    },
    {
      value: assets.audio,
      name: "Audio Track",
    },
  ];

  let completedRequirements: boolean = true;

  for (const requirement of requirements) {
    if (!requirement.value) {
      completedRequirements = false;

      console.log(`Please provide ${requirement.name}`);
    }
  }

  if (!completedRequirements) return;

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

  authorImage.resize(width - quoteMaxWidth, Jimp.AUTO);

  image.composite(authorImage, width - quoteMaxWidth, 0);

  const exportPath = join(renderPath, "background.png");

  await image.writeAsync(exportPath);
};

const loadFonts = async () => {
  const fonts = readdirSync(join(assetsPath, "font")).filter((e) =>
    e.endsWith(".fnt")
  );

  return Promise.all(
    fonts.map((font) => Jimp.loadFont(join(assetsPath, "font", font)))
  );
};

export const createQuotes = async (quotes: Quote[]) => {
  try {
    const { width, height } = resolution;

    const backgroundImagePath = join(renderPath, "background.png");

    // Print Quote and details
    const quoteMaxWidth = width / 1.7;
    const fonts = await loadFonts();

    const maxQuoteHeight = height - 200;

    for (const quote of quotes) {
      const image = await Jimp.read(backgroundImagePath);

      let quoteFont = null;
      let quoteHeight = 0;

      for (const font of fonts) {
        const textHeight = Jimp.measureTextHeight(
          font,
          quote.text,
          quoteMaxWidth
        );

        if (textHeight < maxQuoteHeight && textHeight > quoteHeight) {
          quoteFont = font;
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
          ? Jimp.measureTextHeight(
              detailsFont,
              quote.description,
              quoteMaxWidth
            )
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
              quoteMaxWidth + 80
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
              quoteMaxWidth + 80
            );
          }

          detailsImage.color([{ apply: "xor", params: ["#ffffff"] }]);
        }
      }

      image.composite(
        quoteImage,
        80,
        height / 2 - quoteHeight / 2 - detailsTotalHeight / 2
      );

      if (detailsImage) {
        image.composite(detailsImage, 0, height / 2 + quoteHeight / 2);
      }

      const exportPath = join(renderPath, quote.id + "");

      mkdirSync(exportPath);

      await image.writeAsync(join(exportPath, "image.png"));

      console.log("image-generated");
    }
  } catch (error) {
    console.log(error);
  }
};

export const createOutroImage = async () => {
  const { assets } = getContent();
  const outroPath = join(renderPath, "outro");

  mkdirSync(outroPath);

  const outro =
    "Make sure to subscribe and turn on notification, See you on another video, Bye";

  // Generate Audio File
  const textFilePath = join(outroPath, "text.txt");

  writeFileSync(textFilePath, outro);

  const { width, height } = resolution;

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

  const font = await Jimp.loadFont(join(assetsPath, "font", "90.fnt"));

  const outroText = `Thank you for watching`;

  const outroTextWidth = Jimp.measureText(font, outroText);
  const outroTextHeight = Jimp.measureTextHeight(
    font,
    outroText,
    outroTextWidth + 100
  );
  const outroTextImage = new Jimp(outroTextWidth, outroTextHeight);
  outroTextImage.print(font, 0, 0, outroText);
  outroTextImage.color([{ apply: "xor", params: ["#ffffff"] }]);

  image.composite(outroTextImage, width / 2 - outroTextWidth / 2, 150);

  const imagePath = join(outroPath, "image.png");

  await image.writeAsync(imagePath);
};

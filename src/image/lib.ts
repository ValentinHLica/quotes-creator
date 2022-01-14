import { join } from "path";
import { mkdirSync, readdirSync, writeFileSync } from "fs";

import Jimp from "jimp";

import { assetsPath, renderPath } from "../config/paths";
import { resolution } from "../config/image";
import { Quote, QuoteAssets } from "../interface/content";

import { getContent } from "../utils/helper";

export const createBackgroundImage = async (assets: QuoteAssets) => {
  const { width, height } = resolution;

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
  const authorImageWidth = 870;

  authorImage.resize(authorImageWidth, Jimp.AUTO);

  image.composite(authorImage, width - authorImageWidth, 0);

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
    const quoteMaxWidth = width / 1.6;
    const fonts = await loadFonts();
    const margin = {
      top: 100,
      right: 0,
      bottom: 100,
      left: 80,
    };

    for (const quote of quotes) {
      const background = await Jimp.read(backgroundImagePath);
      const imageHeight = height - (margin.top + margin.bottom);
      const image = new Jimp(quoteMaxWidth, imageHeight);
      const quoteText = `"${quote.text}"`;

      let detailHeight: number = 0;

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

        detailHeight = authorTextHeight + descriptionTextHeight;

        if (detailHeight > 0) {
          if (quote.author) {
            image.print(
              detailsFont,
              0,
              imageHeight - descriptionTextHeight - authorTextHeight,
              {
                text: quote.author,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
              },
              quoteMaxWidth
            );
          }

          if (quote.description) {
            image.print(
              detailsFont,
              0,
              imageHeight - descriptionTextHeight,
              {
                text: quote.description,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
              },
              quoteMaxWidth
            );
          }
          // detailsImage.color([{ apply: "xor", params: ["#ffffff"] }]);

          // background.composite(
          //   detailsImage,
          //   margin.left,
          //   height - margin.bottom
          // );
        }
      }

      let quoteFont = null;
      let quoteHeight = 0;

      const maxQuoteHeight = imageHeight - detailHeight - 100;

      for (const font of fonts) {
        const textHeight = Jimp.measureTextHeight(
          font,
          quoteText,
          quoteMaxWidth
        );

        if (textHeight < maxQuoteHeight && textHeight > quoteHeight) {
          quoteFont = font;
          quoteHeight = textHeight;
        }
      }

      image.print(
        quoteFont,
        0,
        imageHeight / 2 - maxQuoteHeight / 2,
        {
          text: quoteText,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        },
        quoteMaxWidth
      );

      image.color([{ apply: "xor", params: ["#ffffff"] }]);

      background.composite(image, margin.left, margin.top);

      const textFilePath = join(renderPath, `${quote.id}-text.txt`);

      writeFileSync(textFilePath, quote.text);

      await background.writeAsync(join(renderPath, `${quote.id}-image.png`));

      console.log("image-generated");
    }
  } catch (error) {
    // console.log(error);
  }
};

export const createOutroImage = async () => {
  const { assets } = getContent();
  const id = "outro";

  const outro =
    "Make sure to subscribe and turn on notification, See you on another video, Bye";

  // Generate Audio File
  const textFilePath = join(renderPath, `${id}-text.txt`);

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

  await image.writeAsync(join(renderPath, `${id}-image.png`));
};

import { join } from "path";
import { mkdirSync, readdirSync, writeFileSync } from "fs";

import Jimp from "jimp";
import { Font } from "@jimp/plugin-print";

import { assetsPath, renderPath } from "../config/paths";
import { resolution } from "../config/image";
import { margin } from "../config/image";

import { getContent } from "../utils/helper";

export const createBackgroundImage = async () => {
  const {
    assets: { background, avatar, audio },
  } = getContent();

  const { width, height } = resolution;

  // Check Requirements
  const requirements = [
    {
      value: background,
      name: "Background Image",
    },
    {
      value: avatar,
      name: "Avatar Image",
    },
    {
      value: audio,
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
  if (background) {
    const backgroundImage = await Jimp.read(background);
    const blackLayerImage = await Jimp.read(
      join(assetsPath, "black-layer.png")
    );

    if (backgroundImage.getWidth() < backgroundImage.getHeight()) {
      backgroundImage.flip(true, false);
    }

    backgroundImage.cover(width, height);

    backgroundImage.composite(blackLayerImage, 0, 0);

    image.composite(backgroundImage, 0, 0);
  }

  // Add Author Image
  const authorImage = await Jimp.read(avatar);
  const authorImageWidth = 870;

  authorImage.resize(authorImageWidth, Jimp.AUTO);

  image.composite(authorImage, width - authorImageWidth, 0);

  const exportPath = join(renderPath, "background.png");

  await image.writeAsync(exportPath);
};

const loadFonts = async () => {
  const fonts = readdirSync(join(assetsPath, "font", "text")).filter((e) =>
    e.endsWith(".fnt")
  );

  return Promise.all(
    fonts.map((font) => Jimp.loadFont(join(assetsPath, "font", "text", font)))
  );
};

type GetFont = (args: {
  fontFace?: string;
  text?: string;
  width?: number;
  height?: number;
}) => Promise<Font>;

const getFont: GetFont = async ({ fontFace, text, width, height }) => {
  if (fontFace) {
    return await Jimp.loadFont(
      join(join(assetsPath, "font"), `${fontFace}.fnt`)
    );
  }

  const fonts = await loadFonts();

  let selectedFont: Font | null = null;
  let maxHeight: number = 0;

  for (const font of fonts) {
    const textHeight = Jimp.measureTextHeight(font, text, width);

    if (textHeight < height && textHeight > maxHeight) {
      selectedFont = font;
      maxHeight = textHeight;
    }
  }

  return selectedFont;
};

type CreateQuotes = (args: {
  quotes: { quote: string; index: number }[];
  author: string;
  occupation: string;
}) => Promise<void>;
export const createQuotes: CreateQuotes = async ({
  quotes,
  author,
  occupation,
}) => {
  try {
    const { width, height } = resolution;

    const backgroundImagePath = join(renderPath, "background.png");

    // Print Quote and details
    const quoteMaxWidth = width / 2;
    const fonts = await loadFonts();

    for (const quote of quotes) {
      const background = await Jimp.read(backgroundImagePath);
      const imageHeight = height - (margin.top + margin.bottom);
      const image = new Jimp(quoteMaxWidth, imageHeight);
      const quoteText = `“${quote.quote}”`;

      let detailHeight: number = 0;

      if (author || occupation) {
        const authorFont = await Jimp.loadFont(
          join(assetsPath, "font", "text", "50.fnt")
        );
        const occupationFont = await Jimp.loadFont(
          join(assetsPath, "font", "description.fnt")
        );

        const authorTextHeight: number = author
          ? Jimp.measureTextHeight(authorFont, author, quoteMaxWidth)
          : 0;

        const occupationTextHeight: number = occupation
          ? Jimp.measureTextHeight(occupationFont, occupation, quoteMaxWidth)
          : 0;

        detailHeight = authorTextHeight + occupationTextHeight;

        if (detailHeight > 0) {
          if (author) {
            image.print(
              authorFont,
              0,
              imageHeight - occupationTextHeight - authorTextHeight,
              {
                text: author,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
              },
              quoteMaxWidth
            );
          }

          if (occupation) {
            image.print(
              occupationFont,
              0,
              imageHeight - occupationTextHeight,
              {
                text: occupation,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
              },
              quoteMaxWidth
            );
          }
        }
      }

      let quoteFont = null;
      let quoteHeight = 0;

      const maxQuoteHeight = imageHeight - (detailHeight + 70);

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
        maxQuoteHeight / 2 - quoteHeight / 2,
        {
          text: quoteText,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        },
        quoteMaxWidth
      );

      image.color([{ apply: "xor", params: ["#ffffff"] }]);

      background.composite(image, margin.left, margin.top);

      const textFilePath = join(renderPath, `${quote.index}-text.txt`);

      writeFileSync(textFilePath, quote.quote);

      await background.writeAsync(join(renderPath, `${quote.index}-image.png`));

      console.log("image-generated");
    }
  } catch (error) {
    console.log(error);
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
    const blackLayerImage = await Jimp.read(
      join(assetsPath, "black-layer.png")
    );

    if (backgroundImage.getWidth() < backgroundImage.getHeight()) {
      backgroundImage.flip(true, false);
    }

    backgroundImage.cover(width, height);
    backgroundImage.composite(blackLayerImage, 0, 0);

    image.composite(backgroundImage, 0, 0);
  }

  const font = await Jimp.loadFont(join(assetsPath, "font", "text", "90.fnt"));

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

export const createIntroImage = async () => {
  const {
    details: { author, occupation },
  } = getContent();

  const backgroundImagePath = join(renderPath, "background.png");
  const background = await Jimp.read(backgroundImagePath);

  const { width, height } = resolution;
  const contentMaxWidth = width / 2;

  const contentImage = new Jimp(contentMaxWidth, height);

  // Write Author Name
  const authorMaxHeight = 140;
  const authorFont = await getFont({
    text: author,
    width: contentMaxWidth,
    height: authorMaxHeight,
  });

  contentImage.print(
    authorFont,
    0,
    0,
    {
      text: author,
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    contentMaxWidth,
    authorMaxHeight
  );

  // Write Occupation
  const occupationMaxHeight = 100;
  const occupationFont = await getFont({
    fontFace: "intro-occupation",
  });

  contentImage.print(
    occupationFont,
    0,
    authorMaxHeight,
    {
      text: occupation,
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    contentMaxWidth,
    occupationMaxHeight
  );

  // Composite Line
  const lineImage = new Jimp(300, 5, "#000000");

  contentImage.composite(
    lineImage,
    0,
    authorMaxHeight + occupationMaxHeight + 70 / 2
  );

  // Write Description
  // const descriptionFont = await getFont({
  //   fontFace: "intro-description",
  // });

  // contentImage.print(
  //   descriptionFont,
  //   0,
  //   authorMaxHeight + occupationMaxHeight + 70,
  //   description,
  //   contentMaxWidth,
  //   contentMaxHeight - (authorMaxHeight + occupationMaxHeight)
  // );

  const introTextPath = join(renderPath, "intro-text.txt");

  writeFileSync(introTextPath, `Quotes by ${author}`);

  contentImage.color([{ apply: "xor", params: ["#ffffff"] }]);

  background.composite(
    contentImage,
    margin.left,
    height / 2 - (authorMaxHeight + occupationMaxHeight + 70 / 2) / 2
  );

  await background.writeAsync(join(renderPath, "intro.png"));
};

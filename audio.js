const { execSync } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const getArgument = (key) => {
  let value = null;

  const args = process.argv
    .filter((arg) => arg.split("=").length > 1)
    .map((arg) => arg.split("="));

  for (const argument of args) {
    if (argument[0] === key) {
      value = argument[1];
      break;
    }
  }

  return value;
};

const getDuration = (audioPath) => {
  const args = `ffprobe -i "${audioPath}" -show_entries format=duration -v quiet -of csv="p=0"`;

  try {
    return Math.ceil(
      Number(execSync(args, { stdio: "pipe" }).toString().trim())
    );
  } catch (error) {
    // console.log(error);
  }
};

const fps = 30;

const contentFilePath = join(__dirname, "src", "data", "content.json");

const content = JSON.parse(readFileSync(contentFilePath).toString());

const hasAudio = getArgument("AUDIO");

if (hasAudio) {
  let totalDuration = 0;

  const newQuotes = content.quotes.map((quote, index) => {
    const audioFilePath = join(
      __dirname,
      "public",
      "audio",
      `${index}-audio.wav`
    );

    const duration = getDuration(audioFilePath);

    const newQuote = {
      ...quote,
      duration,
      frames: {
        start: index === 0 ? 0 : totalDuration * fps,
        end: (totalDuration + duration) * fps - 1,
      },
    };

    totalDuration += duration;

    return newQuote;
  });

  writeFileSync(
    contentFilePath,
    JSON.stringify({
      quotes: newQuotes,
      totalDuration,
      fps,
    })
  );
} else {
  for (let i = 0; i < content.quotes.length; i++) {
    const quote = content.quotes[i];

    const filePath = join(__dirname, "public", "audio", `${i}-audio.txt`);

    writeFileSync(filePath, quote.text);
  }
}

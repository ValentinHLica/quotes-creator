import generateImage from "./image/index";
import {
  createBackgroundImage,
  createIntroImage,
  createOutroImage,
} from "./image/lib";
import generateVideo from "./video/index";
import { addAudioFilter } from "./audio/lib";

import { resetTemp, getArgument } from "./utils/helper";

const render = async () => {
  console.time("Render");

  const waitAudio = getArgument("AUDIO");

  if (waitAudio) {
    // Reset Temp
    resetTemp();

    await createBackgroundImage();

    // Generate Image
    await generateImage();

    await createIntroImage();

    await createOutroImage();
  } else {
    // Generate Audio
    // await generateAudio();
    addAudioFilter();

    // Generate Video
    await generateVideo();

    console.timeEnd("Render");
  }
};

render();

import generateImage from "./image";
import generateVideo from "./video";
import generateAudio from "./audio";

import { resetTemp } from "./utils/helper";

const render = async () => {
  console.time("Render");

  resetTemp();

  await generateImage();

  await generateAudio();

  await generateVideo();

  console.timeEnd("Render");
};

render();

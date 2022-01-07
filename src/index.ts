import generateImage from "./image/index";
import generateAudio from "./audio/index";
import generateVideo from "./video/index";
import { resetTemp } from "./utils/helper";

const render = async () => {
  // Reset Temp
  resetTemp();

  // Generate Image
  await generateImage();

  // Generate Audio
  await generateAudio();

  // Generate Video
  await generateVideo();
};

render();

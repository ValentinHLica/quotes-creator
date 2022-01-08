import generateImage from "./image/index";
import generateAudio from "./audio/index";
import generateVideo from "./video/index";
import { resetTemp } from "./utils/helper";

import { generateAudioFile } from "./audio/lib";

const render = async () => {
  console.time("Render");

  // Reset Temp
  // resetTemp();

  generateAudioFile({
    textFilePath: "C:\\Users\\gjonl\\Desktop\\text.txt",
    exportPath: "C:\\Users\\gjonl\\Desktop",
  });

  // Generate Image
  // await generateImage();

  // // Generate Audio
  // await generateAudio();

  // // Generate Video
  // await generateVideo();

  console.timeEnd("Render");
};

render();

import fs from "fs";
import os from "os";
import path from "path";

import { bundle } from "@remotion/bundler";
import {
  getCompositions,
  renderFrames,
  stitchFramesToVideo,
} from "@remotion/renderer";

const compositionId = "Quote";

const content = JSON.parse(
  fs.readFileSync(path.join(__dirname, "content.json")).toString()
);

const inputProps = { content };

const render = async () => {
  try {
    const bundled = await bundle(path.join(__dirname, "./src/index.tsx"));
    const comps = await getCompositions(bundled, { inputProps });
    const video = comps.find((c) => c.id === compositionId);
    if (!video) {
      throw new Error(`No video called ${compositionId}`);
    }

    const tmpDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "remotion-")
    );

    const { assetsInfo } = await renderFrames({
      config: video,
      webpackBundle: bundled,
      onStart: () => console.log("Rendering frames..."),
      onFrameUpdate: (f) => {
        if (f % 10 === 0) {
          console.log(`Rendered frame ${f}`);
        }
      },
      parallelism: null,
      outputDir: tmpDir,
      inputProps,
      compositionId,
      imageFormat: "png",
    });

    const finalOutput = path.join(tmpDir, "out.mp4");

    await stitchFramesToVideo({
      dir: tmpDir,
      force: true,
      fps: video.fps,
      height: video.height,
      width: video.width,
      outputLocation: finalOutput,
      imageFormat: "png",
      assetsInfo,
    });

    console.log(`Video rendered: ${finalOutput}`);
  } catch (err) {
    console.error(err);
  }
};

render();

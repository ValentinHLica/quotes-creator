import { Composition } from "remotion";

import Quote from "./components/Quote";

import { Content } from "./interface/content";

import content from "./data/content.json";

import "./styles/main.scss";

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="Quote"
        component={Quote}
        durationInFrames={
          (content as Content).totalDuration * (content as Content).fps
        }
        fps={(content as Content).fps}
        width={1920}
        height={1080}
        defaultProps={{
          content: content as Content,
        }}
      />
    </>
  );
};

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { Content } from "../../interface/content";

import styles from "../../styles/components/Quote/index.module.scss";

type Props = {
  content: Content;
};

const Quote: React.FC<Props> = ({ content }) => {
  const frame = useCurrentFrame();
  const authorImage = staticFile("/author.png");

  return (
    <AbsoluteFill className={styles.quote}>
      {content.quotes.map((quote, index) => {
        if (quote.frames.start <= frame && quote.frames.end >= frame) {
          return (
            <>
              <Audio src={staticFile(`\\${index}-audio.wav`)} />

              <div className={styles.text}>
                <svg viewBox="0 0 56 18">
                  <text x="0" y="15">
                    {quote.text}
                  </text>
                </svg>
              </div>
            </>
          );
        }
      })}

      <Img src={authorImage} className={styles.author} />
    </AbsoluteFill>
  );
};

export default Quote;

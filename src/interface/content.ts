export interface QuoteAssets {
  avatar: string;
  background: string;
  audio: string;
}

export interface Content {
  quotes: string[];
  assets: QuoteAssets;
  details: {
    author: string;
    occupation: string;
  };
  exportPath: string;
}

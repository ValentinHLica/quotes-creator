export interface QuoteAssets {
  avatar: string;
  background?: string;
  audio: string;
}

export interface Quote {
  text: string;
  author?: string;
  description?: string;
  id: number;
}

export interface Content {
  quotes: Quote[];
  assets: QuoteAssets;
  exportPath: string;
}

export interface QuoteAssets {
  avatar: string;
  background?: string;
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

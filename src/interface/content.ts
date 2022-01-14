export interface Quote {
  text: string;
  author?: string;
  description?: string;
  duration: number;
  frames: { start: number; end: number };
}

export interface Content {
  quotes: Quote[];
  totalDuration: number;
  fps: number;
}

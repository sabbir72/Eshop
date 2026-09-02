export interface SuggestedImage {
  id: string;
  url: string;
  thumbnail: string;
  source: string;
  sourceUrl?: string;
  author?: string;
  authorUrl?: string;
  alt: string;
  width?: number;
  height?: number;
  tags?: string[];
}

export interface ImageSuggestionResponse {
  success: boolean;
  query: string;
  provider: string;
  total: number;
  images: SuggestedImage[];
  message?: string;
}

export interface ImageProvider {
  readonly name: string;
  isConfigured(): boolean;
  searchImages(query: string, limit?: number): Promise<SuggestedImage[]>;
}

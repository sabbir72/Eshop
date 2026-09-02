/**
 * Product Image Background Editor & Processor Architecture Types
 */

export type BackgroundCategory =
  | "all"
  | "solid"
  | "gradient"
  | "studio"
  | "ecommerce"
  | "minimal"
  | "lifestyle"
  | "custom";

export type BackgroundType = "color" | "gradient" | "image" | "pattern";

export interface LightingConfig {
  shadowIntensity: number; // 0 to 1
  shadowBlur: number; // in pixels
  shadowOffsetX: number;
  shadowOffsetY: number;
  groundReflection: boolean;
  ambientLightColor?: string;
  ambientLightIntensity?: number; // 0 to 1
}

export interface BackgroundSuggestion {
  id: string;
  name: string;
  category: BackgroundCategory;
  type: BackgroundType;
  value: string; // Hex color, CSS gradient, or image URL
  previewThumbnail: string;
  description?: string;
  badge?: string;
  lighting?: Partial<LightingConfig>;
}

export interface BackgroundRemovalOptions {
  tolerance?: number; // 0 to 100, color distance threshold for boundary keying
  edgeFeather?: number; // 0 to 10, blur/softness on cutout perimeter
  contrastAdjustment?: number; // -50 to 50
  smoothEdges?: boolean;
  autoDetectSubject?: boolean;
}

export interface BackgroundRemovalResult {
  success: boolean;
  cutoutImageUrl?: string; // Transparent PNG data URL or remote URL
  maskUrl?: string;
  format: "png";
  width?: number;
  height?: number;
  provider: string;
  processingTimeMs: number;
  message?: string;
  error?: string;
}

export interface BackgroundRemovalProvider {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isAI: boolean;
  isConfigured(): boolean;
  removeBackground(
    imageSource: string | File | Blob,
    options?: BackgroundRemovalOptions
  ): Promise<BackgroundRemovalResult>;
}

export interface BackgroundProvider {
  getSuggestions(): BackgroundSuggestion[];
  getSuggestionsByCategory(category: BackgroundCategory): BackgroundSuggestion[];
}

export interface ImageCompositionOptions {
  productScale?: number; // 0.2 to 2.0 (default 0.9)
  positionX?: number; // -100 to 100 (% offset from center)
  positionY?: number; // -100 to 100 (% offset from bottom/center)
  rotation?: number; // -180 to 180 deg
  lighting?: Partial<LightingConfig>;
  outputFormat?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number; // 0.1 to 1.0 (default 0.95)
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  fileSizeMb?: number;
  dimensions?: { width: number; height: number };
}

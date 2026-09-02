import {
  BackgroundCategory,
  BackgroundRemovalOptions,
  BackgroundRemovalProvider,
  BackgroundRemovalResult,
  BackgroundSuggestion,
  ImageCompositionOptions,
  ImageValidationResult,
} from "./types";
import { BACKGROUND_PRESETS } from "./backgroundPresets";
import { CanvasSegmentationProvider } from "./providers/CanvasSegmentationProvider";
import { GeminiBackgroundRemovalProvider } from "./providers/GeminiBackgroundRemovalProvider";
import { ExternalApiBackgroundProvider } from "./providers/ExternalApiBackgroundProvider";

export class ImageEditorService {
  private providers: Map<string, BackgroundRemovalProvider> = new Map();
  private presets: BackgroundSuggestion[] = BACKGROUND_PRESETS;
  private activeProviderId: string = "canvas";

  constructor() {
    // Register Default Providers
    this.registerProvider(new CanvasSegmentationProvider());
    this.registerProvider(new GeminiBackgroundRemovalProvider());
    this.registerProvider(new ExternalApiBackgroundProvider());
  }

  /**
   * Register a new background removal provider
   */
  public registerProvider(provider: BackgroundRemovalProvider): void {
    this.providers.set(provider.id.toLowerCase(), provider);
  }

  /**
   * Get all registered providers
   */
  public getProviders(): BackgroundRemovalProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider by ID
   */
  public getProvider(id: string): BackgroundRemovalProvider | undefined {
    return this.providers.get(id.toLowerCase());
  }

  /**
   * Check if any valid image processing provider is configured
   */
  public isServiceAvailable(): boolean {
    for (const provider of this.providers.values()) {
      if (provider.isConfigured()) return true;
    }
    return false;
  }

  /**
   * Validate uploaded image file security & constraints
   */
  public validateImageFile(file: File): ImageValidationResult {
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    const ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "image/bmp",
    ];

    if (!file) {
      return { isValid: false, error: "No file provided" };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: `Unsupported file format (${file.type || "unknown"}). Allowed formats: PNG, JPG, WEBP, AVIF, GIF.`,
      };
    }

    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB.`,
        fileSizeMb: parseFloat(sizeMb),
      };
    }

    return {
      isValid: true,
      fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
    };
  }

  /**
   * Get all preset backgrounds or filtered by category
   */
  public getBackgroundPresets(category: BackgroundCategory = "all"): BackgroundSuggestion[] {
    if (!category || category === "all") {
      return this.presets;
    }
    return this.presets.filter((p) => p.category === category);
  }

  /**
   * Get preset by ID
   */
  public getPresetById(id: string): BackgroundSuggestion | undefined {
    return this.presets.find((p) => p.id === id);
  }

  /**
   * Remove background using active/preferred provider with smart fallback
   */
  public async removeBackground(
    imageSource: string | File | Blob,
    options: BackgroundRemovalOptions = {},
    preferredProviderId?: string
  ): Promise<BackgroundRemovalResult> {
    const targetId = (preferredProviderId || this.activeProviderId).toLowerCase();
    let provider = this.providers.get(targetId);

    // Fallback to canvas if requested provider not found or not configured
    if (!provider || !provider.isConfigured()) {
      provider = this.providers.get("canvas");
    }

    if (!provider) {
      return {
        success: false,
        format: "png",
        provider: "none",
        processingTimeMs: 0,
        error: "Background editing is currently unavailable.",
      };
    }

    try {
      const result = await provider.removeBackground(imageSource, options);

      // If AI provider failed, fallback gracefully to Smart Canvas
      if (!result.success && provider.id !== "canvas") {
        const canvasProvider = this.providers.get("canvas");
        if (canvasProvider && canvasProvider.isConfigured()) {
          console.info("[ImageEditorService] Falling back to Canvas Alpha Segmenter...");
          return await canvasProvider.removeBackground(imageSource, options);
        }
      }

      return result;
    } catch (err: any) {
      console.error("[ImageEditorService removeBackground Error]:", err);
      // Fallback attempt
      const canvasProvider = this.providers.get("canvas");
      if (canvasProvider && canvasProvider.isConfigured()) {
        return await canvasProvider.removeBackground(imageSource, options);
      }

      return {
        success: false,
        format: "png",
        provider: provider.name,
        processingTimeMs: 0,
        error: "Background editing is currently unavailable.",
      };
    }
  }

  /**
   * HTML5 Canvas High-Fidelity Compositor
   * Combines foreground cutout + chosen background (Solid / Gradient / Image) + contact shadow
   */
  public async compositeImage(
    foregroundSource: string,
    background: BackgroundSuggestion | string,
    options: ImageCompositionOptions = {}
  ): Promise<string> {
    const {
      productScale = 0.9,
      positionX = 0, // % offset
      positionY = 0, // % offset
      rotation = 0,
      outputFormat = "image/png",
      quality = 0.95,
      canvasWidth = 1000,
      canvasHeight = 1000,
    } = options;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D context is unavailable.");
    }

    // 1. Draw Background
    await this.renderBackground(ctx, background, canvasWidth, canvasHeight);

    // 2. Load Foreground Cutout
    const fgImg = await this.loadImageElement(foregroundSource);

    // 3. Compute Product Dimensions & Center Anchor
    const aspect = fgImg.naturalWidth / fgImg.naturalHeight;
    let targetW = canvasWidth * 0.75 * productScale;
    let targetH = targetW / aspect;

    if (targetH > canvasHeight * 0.8 * productScale) {
      targetH = canvasHeight * 0.8 * productScale;
      targetW = targetH * aspect;
    }

    const centerX = canvasWidth / 2 + (positionX / 100) * (canvasWidth / 2);
    const centerY = canvasHeight / 2 + (positionY / 100) * (canvasHeight / 2);

    const x = centerX - targetW / 2;
    const y = centerY - targetH / 2;

    // 4. Render Ground Contact Drop Shadow
    const lighting = typeof background === "object" ? background.lighting : options.lighting;
    const shadowIntensity = lighting?.shadowIntensity ?? 0.35;
    const shadowBlur = lighting?.shadowBlur ?? 16;
    const shadowOffsetY = lighting?.shadowOffsetY ?? 14;

    if (shadowIntensity > 0) {
      ctx.save();
      // Elliptical soft contact shadow under base of product
      const shadowW = targetW * 0.75;
      const shadowH = Math.max(12, targetH * 0.08);
      const shadowX = centerX;
      const shadowY = y + targetH - shadowH / 3 + shadowOffsetY;

      const shadowGrad = ctx.createRadialGradient(
        shadowX,
        shadowY,
        0,
        shadowX,
        shadowY,
        shadowW / 2
      );
      shadowGrad.addColorStop(0, `rgba(15, 23, 42, ${shadowIntensity})`);
      shadowGrad.addColorStop(0.5, `rgba(15, 23, 42, ${shadowIntensity * 0.4})`);
      shadowGrad.addColorStop(1, "rgba(15, 23, 42, 0)");

      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(shadowX, shadowY, shadowW / 2, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw Foreground Object with Rotation & Position
    ctx.save();
    ctx.translate(centerX, centerY);
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    ctx.drawImage(fgImg, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();

    return canvas.toDataURL(outputFormat, quality);
  }

  /**
   * Render background onto canvas context
   */
  private async renderBackground(
    ctx: CanvasRenderingContext2D,
    background: BackgroundSuggestion | string,
    width: number,
    height: number
  ): Promise<void> {
    if (typeof background === "string") {
      // Hex or CSS color string
      if (background.startsWith("#") || background.startsWith("rgb")) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      } else if (background.startsWith("data:") || background.startsWith("http")) {
        const bgImg = await this.loadImageElement(background);
        this.drawCoverImage(ctx, bgImg, width, height);
      }
      return;
    }

    if (background.type === "color") {
      ctx.fillStyle = background.value;
      ctx.fillRect(0, 0, width, height);
    } else if (background.type === "gradient") {
      this.drawGradient(ctx, background.value, width, height);
    } else if (background.type === "image") {
      try {
        const bgImg = await this.loadImageElement(background.value);
        this.drawCoverImage(ctx, bgImg, width, height);
      } catch {
        // Fallback to light gray if remote texture is unreachable
        ctx.fillStyle = "#F3F4F6";
        ctx.fillRect(0, 0, width, height);
      }
    }
  }

  /**
   * Draw CSS-like linear or radial gradient onto canvas
   */
  private drawGradient(
    ctx: CanvasRenderingContext2D,
    gradientStr: string,
    width: number,
    height: number
  ): void {
    if (gradientStr.startsWith("radial-gradient")) {
      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        width * 0.05,
        width / 2,
        height * 0.45,
        width * 0.75
      );
      if (gradientStr.includes("#FEF3C7")) {
        grad.addColorStop(0, "#FEF3C7");
        grad.addColorStop(0.6, "#F3F4F6");
        grad.addColorStop(1, "#E5E7EB");
      } else {
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.55, "#E5E7EB");
        grad.addColorStop(1, "#D1D5DB");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Linear gradient from top-left (0,0) to bottom-right (w,h)
      const grad = ctx.createLinearGradient(0, 0, width, height);

      if (gradientStr.includes("#FFF7ED")) {
        grad.addColorStop(0, "#FFF7ED");
        grad.addColorStop(0.4, "#FFEDD5");
        grad.addColorStop(1, "#FFE4E6");
      } else if (gradientStr.includes("#FAF5FF")) {
        grad.addColorStop(0, "#FAF5FF");
        grad.addColorStop(0.5, "#EDE9FE");
        grad.addColorStop(1, "#DDD6FE");
      } else if (gradientStr.includes("#F0FDF4")) {
        grad.addColorStop(0, "#F0FDF4");
        grad.addColorStop(0.5, "#DCFCE7");
        grad.addColorStop(1, "#BBF7D0");
      } else if (gradientStr.includes("#090D16")) {
        grad.addColorStop(0, "#090D16");
        grad.addColorStop(0.5, "#1E1B4B");
        grad.addColorStop(1, "#311042");
      } else {
        grad.addColorStop(0, "#F8FAFC");
        grad.addColorStop(0.5, "#E2E8F0");
        grad.addColorStop(1, "#CBD5E1");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * Draw image with object-fit: cover logic
   */
  private drawCoverImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number
  ): void {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let renderW = width;
    let renderH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      renderW = height * imgRatio;
      offsetX = (width - renderW) / 2;
    } else {
      renderH = width / imgRatio;
      offsetY = (height - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  private loadImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url.slice(0, 40)}...`));
      img.src = url;
    });
  }
}

export const imageEditorService = new ImageEditorService();

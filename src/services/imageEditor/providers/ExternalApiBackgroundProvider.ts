import {
  BackgroundRemovalOptions,
  BackgroundRemovalProvider,
  BackgroundRemovalResult,
} from "../types";

/**
 * External Cloud API Provider (Remove.bg / ClipDrop / Cloudinary integration ready)
 */
export class ExternalApiBackgroundProvider implements BackgroundRemovalProvider {
  public readonly id = "cloud_api";
  public readonly name = "External Cloud Studio API";
  public readonly description = "Integration provider for RemoveBG / Photoroom cloud APIs";
  public readonly isAI = true;

  private apiKey: string = "";

  constructor() {
    if (typeof process !== "undefined" && process.env?.REMOVEBG_API_KEY) {
      this.apiKey = process.env.REMOVEBG_API_KEY;
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async removeBackground(
    imageSource: string | File | Blob,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return {
        success: false,
        format: "png",
        provider: this.name,
        processingTimeMs: Date.now() - startTime,
        error: "External image processing provider is not configured. Set REMOVEBG_API_KEY in .env",
      };
    }

    try {
      const response = await fetch("/api/image-editor/remove-background?provider=cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: typeof imageSource === "string" ? imageSource : undefined,
          options,
        }),
      });

      const data = await response.json();
      return {
        success: data.success,
        cutoutImageUrl: data.cutoutImageUrl,
        format: "png",
        provider: this.name,
        processingTimeMs: Date.now() - startTime,
        message: data.message,
        error: data.error,
      };
    } catch (err: any) {
      return {
        success: false,
        format: "png",
        provider: this.name,
        processingTimeMs: Date.now() - startTime,
        error: err.message || "Cloud image API error",
      };
    }
  }
}

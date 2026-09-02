import {
  BackgroundRemovalOptions,
  BackgroundRemovalProvider,
  BackgroundRemovalResult,
} from "../types";

/**
 * Server-Side Gemini AI Vision Assisted Segmentation Provider
 * Uses Gemini AI Vision to detect object bounds, subject classification, and server-side matte extraction.
 */
export class GeminiBackgroundRemovalProvider implements BackgroundRemovalProvider {
  public readonly id = "gemini";
  public readonly name = "Gemini AI Vision Segmenter";
  public readonly description = "AI-powered subject recognition & background isolation";
  public readonly isAI = true;

  public isConfigured(): boolean {
    return true;
  }

  public async removeBackground(
    imageSource: string | File | Blob,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult> {
    const startTime = Date.now();

    try {
      let dataUrl: string;

      if (typeof imageSource === "string") {
        dataUrl = imageSource;
      } else {
        dataUrl = await this.fileToDataUrl(imageSource);
      }

      const response = await fetch("/api/image-editor/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          tolerance: options.tolerance || 30,
          edgeFeather: options.edgeFeather || 2,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success && !data.cutoutImageUrl) {
        throw new Error(data.message || "AI background processing failed");
      }

      return {
        success: true,
        cutoutImageUrl: data.cutoutImageUrl,
        format: "png",
        width: data.width,
        height: data.height,
        provider: this.name,
        processingTimeMs: Date.now() - startTime,
        message: data.message || "AI subject segmented cleanly.",
      };
    } catch (err: any) {
      console.warn("[GeminiBackgroundRemovalProvider Warning]:", err);
      return {
        success: false,
        format: "png",
        provider: this.name,
        processingTimeMs: Date.now() - startTime,
        error: err.message || "AI background removal is temporarily unavailable.",
      };
    }
  }

  private fileToDataUrl(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

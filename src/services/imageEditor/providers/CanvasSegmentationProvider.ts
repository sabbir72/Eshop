import {
  BackgroundRemovalOptions,
  BackgroundRemovalProvider,
  BackgroundRemovalResult,
} from "../types";

/**
 * High-Precision Client-Side HTML5 Canvas Background Removal Provider
 * Uses intelligent boundary sampling, Euclidean color delta, flood fill keying,
 * and multi-pass alpha feathering to produce transparent cutout PNGs with no server latency.
 */
export class CanvasSegmentationProvider implements BackgroundRemovalProvider {
  public readonly id = "canvas";
  public readonly name = "Smart Canvas Alpha Segmenter";
  public readonly description = "High-speed client-side edge extraction & alpha matting engine";
  public readonly isAI = false;

  public isConfigured(): boolean {
    // Canvas 2D is natively available in all modern browsers
    return typeof document !== "undefined" && typeof window !== "undefined";
  }

  public async removeBackground(
    imageSource: string | File | Blob,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult> {
    const startTime = Date.now();

    try {
      // 1. Resolve source to an HTMLImageElement
      const img = await this.loadImage(imageSource);
      const width = img.naturalWidth || img.width || 800;
      const height = img.naturalHeight || img.height || 800;

      // 2. Setup Offscreen Canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        throw new Error("Unable to initialize 2D canvas context.");
      }

      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // 3. Sample corner & perimeter background references
      const bgSamples = this.samplePerimeterColors(data, width, height);

      // Options
      const tolerance = options.tolerance !== undefined ? options.tolerance : 28;
      const edgeFeather = options.edgeFeather !== undefined ? options.edgeFeather : 2;

      // 4. Create Alpha Mask with Euclidean distance & Smooth Step
      const alphaMask = new Uint8ClampedArray(width * height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a === 0) {
            alphaMask[y * width + x] = 0;
            continue;
          }

          // Compute minimum distance to any sampled background reference
          let minDistance = Infinity;
          for (const bg of bgSamples) {
            const dist = this.colorDistance(r, g, b, bg.r, bg.g, bg.b);
            if (dist < minDistance) {
              minDistance = dist;
            }
          }

          // Smooth step threshold for anti-aliasing
          const lowerBound = tolerance * 0.8;
          const upperBound = tolerance * 1.5;

          if (minDistance <= lowerBound) {
            alphaMask[y * width + x] = 0; // Completely transparent
          } else if (minDistance >= upperBound) {
            alphaMask[y * width + x] = 255; // Fully opaque foreground
          } else {
            // Smooth gradient transition
            const factor = (minDistance - lowerBound) / (upperBound - lowerBound);
            alphaMask[y * width + x] = Math.round(factor * 255);
          }
        }
      }

      // 5. Apply perimeter flood constraint so internal bright product spots aren't wiped
      this.floodFromEdges(alphaMask, width, height);

      // 6. Apply Feathering & Smoothing
      if (edgeFeather > 0) {
        this.boxBlurAlpha(alphaMask, width, height, edgeFeather);
      }

      // 7. Write back alpha channel to ImageData
      for (let i = 0; i < width * height; i++) {
        const pixelIdx = i * 4;
        const currentAlpha = data[pixelIdx + 3];
        const newAlpha = (currentAlpha * alphaMask[i]) / 255;
        data[pixelIdx + 3] = Math.min(currentAlpha, Math.round(newAlpha));
      }

      ctx.putImageData(imgData, 0, 0);

      // 8. Export as transparent PNG Data URL
      const cutoutImageUrl = canvas.toDataURL("image/png");

      return {
        success: true,
        cutoutImageUrl,
        format: "png",
        width,
        height,
        provider: this.name,
        processingTimeMs: Date.now() - startTime,
        message: "Background extracted successfully with smart alpha matting.",
      };
    } catch (err: any) {
      console.error("[CanvasSegmentationProvider Error]:", err);
      return {
        success: false,
        format: "png",
        provider: this.name,
        processingTimeMs: Date.now() - startTime,
        error: err.message || "Failed to process image background.",
      };
    }
  }

  /**
   * Helper to load Image from URL, Blob, or File
   */
  private loadImage(source: string | File | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error("Failed to load source image for editing."));

      if (typeof source === "string") {
        img.src = source;
      } else {
        const url = URL.createObjectURL(source);
        img.src = url;
      }
    });
  }

  /**
   * Sample edge and corner colors from the perimeter of the image
   */
  private samplePerimeterColors(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): Array<{ r: number; g: number; b: number }> {
    const samples: Array<{ r: number; g: number; b: number }> = [];
    const stepX = Math.max(1, Math.floor(width / 30));
    const stepY = Math.max(1, Math.floor(height / 30));

    const addSample = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 10) {
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    };

    // Corners
    addSample(0, 0);
    addSample(width - 1, 0);
    addSample(0, height - 1);
    addSample(width - 1, height - 1);

    // Top & Bottom Edges
    for (let x = 0; x < width; x += stepX) {
      addSample(x, 0);
      addSample(x, height - 1);
    }

    // Left & Right Edges
    for (let y = 0; y < height; y += stepY) {
      addSample(0, y);
      addSample(width - 1, y);
    }

    // Deduplicate similar background samples
    const unique: Array<{ r: number; g: number; b: number }> = [];
    for (const s of samples) {
      const exists = unique.some(
        (u) => this.colorDistance(s.r, s.g, s.b, u.r, u.g, u.b) < 15
      );
      if (!exists) {
        unique.push(s);
      }
    }

    // Fallback to pure white if empty
    if (unique.length === 0) {
      unique.push({ r: 255, g: 255, b: 255 });
    }

    return unique;
  }

  /**
   * Perceptually weighted Euclidean color distance (Redmean metric)
   */
  private colorDistance(
    r1: number,
    g1: number,
    b1: number,
    r2: number,
    g2: number,
    b2: number
  ): number {
    const rmean = (r1 + r2) / 2;
    const r = r1 - r2;
    const g = g1 - g2;
    const b = b1 - b2;
    return Math.sqrt(
      (((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8)
    );
  }

  /**
   * Flood connectivity check from outer boundaries to prevent removing isolated center highlights
   */
  private floodFromEdges(
    mask: Uint8ClampedArray,
    width: number,
    height: number
  ): void {
    const visited = new Uint8Array(width * height);
    const queue: number[] = [];

    const pushIfBg = (x: number, y: number) => {
      const idx = y * width + x;
      if (!visited[idx] && mask[idx] < 128) {
        visited[idx] = 1;
        queue.push(idx);
      }
    };

    // Push all edges
    for (let x = 0; x < width; x++) {
      pushIfBg(x, 0);
      pushIfBg(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      pushIfBg(0, y);
      pushIfBg(width - 1, y);
    }

    // BFS flood
    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const x = idx % width;
      const y = Math.floor(idx / width);

      if (x > 0) pushIfBg(x - 1, y);
      if (x < width - 1) pushIfBg(x + 1, y);
      if (y > 0) pushIfBg(x, y - 1);
      if (y < height - 1) pushIfBg(x, y + 1);
    }

    // Any pixel marked as transparent (< 128) but NOT reachable from boundary was inside product: restore it!
    for (let i = 0; i < width * height; i++) {
      if (!visited[i] && mask[i] < 128) {
        mask[i] = 255; // Keep foreground
      }
    }
  }

  /**
   * 1D Separable Box Blur for edge feathering
   */
  private boxBlurAlpha(
    mask: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number
  ): void {
    const temp = new Uint8ClampedArray(width * height);

    // Horizontal
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const nx = x + k;
          if (nx >= 0 && nx < width) {
            sum += mask[y * width + nx];
            count++;
          }
        }
        temp[y * width + x] = Math.round(sum / count);
      }
    }

    // Vertical
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const ny = y + k;
          if (ny >= 0 && ny < height) {
            sum += temp[ny * width + x];
            count++;
          }
        }
        mask[y * width + x] = Math.round(sum / count);
      }
    }
  }
}

import { ImageProvider, SuggestedImage } from "../types";

export class PexelsProvider implements ImageProvider {
  readonly name = "Pexels";

  isConfigured(): boolean {
    const key = process.env.PEXELS_API_KEY || process.env.IMAGE_PROVIDER_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  async searchImages(query: string, limit = 8): Promise<SuggestedImage[]> {
    const apiKey = process.env.PEXELS_API_KEY || process.env.IMAGE_PROVIDER_API_KEY;
    if (!apiKey) {
      throw new Error("Pexels API Key not configured");
    }

    const endpoint = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=${limit}&orientation=square`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const resp = await fetch(endpoint, {
        headers: {
          Authorization: apiKey,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`Pexels API responded with status ${resp.status}`);
      }

      const data = await resp.json();
      const photos: any[] = data.photos || [];

      return photos.map((item) => ({
        id: `pexels-${item.id}`,
        url: item.src?.large || item.src?.original || item.src?.medium,
        thumbnail: item.src?.medium || item.src?.small,
        source: "Pexels",
        sourceUrl: item.url || "https://www.pexels.com",
        author: item.photographer || "Pexels Contributor",
        authorUrl: item.photographer_url || "https://www.pexels.com",
        alt: item.alt || query,
        width: item.width || 800,
        height: item.height || 800,
      }));
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`Pexels Search Error: ${err.message || err}`);
    }
  }
}

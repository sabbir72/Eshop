import { ImageProvider, SuggestedImage } from "../types";

export class UnsplashProvider implements ImageProvider {
  readonly name = "Unsplash";

  isConfigured(): boolean {
    const key = process.env.UNSPLASH_ACCESS_KEY || process.env.IMAGE_PROVIDER_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  async searchImages(query: string, limit = 8): Promise<SuggestedImage[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.IMAGE_PROVIDER_API_KEY;
    if (!accessKey) {
      throw new Error("Unsplash Access Key not configured");
    }

    const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=${limit}&orientation=squarish`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const resp = await fetch(endpoint, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`Unsplash API responded with status ${resp.status}`);
      }

      const data = await resp.json();
      const results: any[] = data.results || [];

      return results.map((item) => ({
        id: `unsplash-${item.id}`,
        url: item.urls?.regular || item.urls?.full || item.urls?.small,
        thumbnail: item.urls?.small || item.urls?.thumb,
        source: "Unsplash",
        sourceUrl: item.links?.html || "https://unsplash.com",
        author: item.user?.name || item.user?.username || "Unsplash Creator",
        authorUrl: item.user?.links?.html || "https://unsplash.com",
        alt: item.alt_description || item.description || query,
        width: item.width || 800,
        height: item.height || 800,
      }));
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`Unsplash Search Error: ${err.message || err}`);
    }
  }
}

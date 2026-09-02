import { ImageProvider, SuggestedImage } from "../types";

export class PixabayProvider implements ImageProvider {
  readonly name = "Pixabay";

  isConfigured(): boolean {
    const key = process.env.PIXABAY_API_KEY || process.env.IMAGE_PROVIDER_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  async searchImages(query: string, limit = 8): Promise<SuggestedImage[]> {
    const apiKey = process.env.PIXABAY_API_KEY || process.env.IMAGE_PROVIDER_API_KEY;
    if (!apiKey) {
      throw new Error("Pixabay API Key not configured");
    }

    const endpoint = `https://pixabay.com/api/?key=${encodeURIComponent(
      apiKey
    )}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${limit}&safesearch=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const resp = await fetch(endpoint, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`Pixabay API responded with status ${resp.status}`);
      }

      const data = await resp.json();
      const hits: any[] = data.hits || [];

      return hits.map((item) => ({
        id: `pixabay-${item.id}`,
        url: item.largeImageURL || item.webformatURL,
        thumbnail: item.previewURL || item.webformatURL,
        source: "Pixabay",
        sourceUrl: item.pageURL || "https://pixabay.com",
        author: item.user || "Pixabay Artist",
        authorUrl: `https://pixabay.com/users/${item.user}-${item.user_id}/`,
        alt: item.tags || query,
        width: item.imageWidth || 800,
        height: item.imageHeight || 800,
      }));
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`Pixabay Search Error: ${err.message || err}`);
    }
  }
}

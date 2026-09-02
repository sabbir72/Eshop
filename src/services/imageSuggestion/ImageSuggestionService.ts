import { ImageProvider, ImageSuggestionResponse, SuggestedImage } from "./types";
import { CuratedFallbackProvider } from "./providers/CuratedFallbackProvider";
import { UnsplashProvider } from "./providers/UnsplashProvider";
import { PexelsProvider } from "./providers/PexelsProvider";
import { PixabayProvider } from "./providers/PixabayProvider";

interface CacheEntry {
  timestamp: number;
  data: SuggestedImage[];
  provider: string;
}

export class ImageSuggestionService {
  private providers: Map<string, ImageProvider> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.registerProvider("curated", new CuratedFallbackProvider());
    this.registerProvider("unsplash", new UnsplashProvider());
    this.registerProvider("pexels", new PexelsProvider());
    this.registerProvider("pixabay", new PixabayProvider());
  }

  /**
   * Register a new or custom image provider at runtime
   */
  public registerProvider(id: string, provider: ImageProvider): void {
    this.providers.set(id.toLowerCase(), provider);
  }

  /**
   * Get all registered provider identifiers
   */
  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Clean & sanitize product name query
   */
  public sanitizeQuery(query: string): string {
    if (!query) return "";
    return query
      .replace(/[^\w\s\-,.'&]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  }

  /**
   * Get image suggestions for a product name or custom query
   */
  public async getSuggestions(
    rawQuery: string,
    limit = 8,
    preferredProvider?: string
  ): Promise<ImageSuggestionResponse> {
    const cleanQuery = this.sanitizeQuery(rawQuery);

    if (!cleanQuery || cleanQuery.length < 2) {
      return {
        success: true,
        query: cleanQuery,
        provider: "none",
        total: 0,
        images: [],
        message: "Query too short to generate suggestions.",
      };
    }

    const cacheKey = `${cleanQuery.toLowerCase()}_${limit}_${preferredProvider || "auto"}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return {
        success: true,
        query: cleanQuery,
        provider: `${cached.provider} (cached)`,
        total: cached.data.length,
        images: cached.data,
      };
    }

    const selectedProviderKey = (
      preferredProvider ||
      process.env.IMAGE_PROVIDER ||
      "auto"
    ).toLowerCase();

    // Strategy 1: Specific named provider requested
    if (selectedProviderKey !== "auto" && this.providers.has(selectedProviderKey)) {
      const provider = this.providers.get(selectedProviderKey)!;
      if (provider.isConfigured()) {
        try {
          const results = await provider.searchImages(cleanQuery, limit);
          if (results.length > 0) {
            this.cache.set(cacheKey, { timestamp: Date.now(), data: results, provider: provider.name });
            return {
              success: true,
              query: cleanQuery,
              provider: provider.name,
              total: results.length,
              images: results,
            };
          }
        } catch (err: any) {
          console.warn(`[ImageSuggestionService] Provider '${provider.name}' failed:`, err.message);
          // Fall back to curated
        }
      }
    }

    // Strategy 2: Auto mode - check configured external providers first (Unsplash -> Pexels -> Pixabay)
    if (selectedProviderKey === "auto") {
      const activeExternalProviders: ImageProvider[] = [];
      const unsplash = this.providers.get("unsplash");
      const pexels = this.providers.get("pexels");
      const pixabay = this.providers.get("pixabay");

      if (unsplash && unsplash.isConfigured()) activeExternalProviders.push(unsplash);
      if (pexels && pexels.isConfigured()) activeExternalProviders.push(pexels);
      if (pixabay && pixabay.isConfigured()) activeExternalProviders.push(pixabay);

      for (const provider of activeExternalProviders) {
        try {
          const results = await provider.searchImages(cleanQuery, limit);
          if (results.length > 0) {
            this.cache.set(cacheKey, { timestamp: Date.now(), data: results, provider: provider.name });
            return {
              success: true,
              query: cleanQuery,
              provider: provider.name,
              total: results.length,
              images: results,
            };
          }
        } catch (err: any) {
          console.warn(`[ImageSuggestionService] Auto provider '${provider.name}' failed:`, err.message);
        }
      }
    }

    // Strategy 3: Guaranteed Curated Fallback
    const fallback = this.providers.get("curated") || new CuratedFallbackProvider();
    try {
      const fallbackResults = await fallback.searchImages(cleanQuery, limit);
      this.cache.set(cacheKey, { timestamp: Date.now(), data: fallbackResults, provider: fallback.name });
      return {
        success: true,
        query: cleanQuery,
        provider: fallback.name,
        total: fallbackResults.length,
        images: fallbackResults,
      };
    } catch (err: any) {
      console.error("[ImageSuggestionService] Curated fallback error:", err);
      return {
        success: false,
        query: cleanQuery,
        provider: "none",
        total: 0,
        images: [],
        message: "Image suggestions are temporarily unavailable.",
      };
    }
  }
}

export const imageSuggestionService = new ImageSuggestionService();

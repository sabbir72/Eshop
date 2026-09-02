import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  RefreshCw,
  Upload,
  Check,
  Plus,
  ExternalLink,
  Eye,
  AlertCircle,
  Search,
  X,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { SuggestedImage } from "../../services/imageSuggestion/types";

interface ProductImageSuggestionsProps {
  productName: string;
  currentMainImage: string;
  currentGalleryImages: string[];
  onSelectMainImage: (url: string) => void;
  onAddGalleryImage: (url: string) => void;
  onRemoveGalleryImage?: (url: string) => void;
  onSwitchToMediaTab?: () => void;
  className?: string;
  compact?: boolean;
}

export const ProductImageSuggestions: React.FC<ProductImageSuggestionsProps> = ({
  productName,
  currentMainImage,
  currentGalleryImages,
  onSelectMainImage,
  onAddGalleryImage,
  onRemoveGalleryImage,
  onSwitchToMediaTab,
  className = "",
  compact = false,
}) => {
  const [query, setQuery] = useState("");
  const [customSearch, setCustomSearch] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [images, setImages] = useState<SuggestedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<SuggestedImage | null>(null);

  // Active abort controller for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize product name when not in manual custom search mode
  useEffect(() => {
    if (!isCustomMode) {
      setQuery(productName);
    }
  }, [productName, isCustomMode]);

  // Debounced fetch handler
  useEffect(() => {
    const trimmed = query.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!trimmed || trimmed.length < 2) {
      setImages([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, 600); // 600ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    // Cancel previous inflight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const resp = await fetch(
        `/api/products/image-suggestions?query=${encodeURIComponent(searchQuery)}&limit=8`,
        { signal: controller.signal }
      );

      if (!resp.ok) {
        throw new Error(`Server returned HTTP ${resp.status}`);
      }

      const data = await resp.json();

      if (data.success) {
        setImages(data.images || []);
        setProviderName(data.provider || "Smart Catalog");
      } else {
        setError(data.message || "Image suggestions are temporarily unavailable.");
        setImages([]);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // Request was aborted by newer keystroke
      }
      console.warn("[Image Suggestions Frontend Warning]:", err);
      setError("Image suggestions are temporarily unavailable.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const activeTerm = isCustomMode ? customSearch : productName;
    if (activeTerm.trim().length >= 2) {
      fetchSuggestions(activeTerm.trim());
    }
  };

  const handleApplyCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearch.trim().length >= 2) {
      setQuery(customSearch.trim());
    }
  };

  // Check if an image is already in gallery
  const isInGallery = (url: string) => currentGalleryImages.includes(url);
  const isMainImage = (url: string) => currentMainImage === url;

  // If there's no query and no images, return subtle placeholder or empty container
  if (!query && images.length === 0 && !loading && !error) {
    return null;
  }

  return (
    <div
      className={`bg-slate-50/90 border border-indigo-100 rounded-2xl p-4 transition-all ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">
                AI / Image Suggestions
              </h4>
              {providerName && (
                <span className="text-[10px] bg-indigo-100/70 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {providerName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {query.trim()
                ? `Relevant product images found for: "${query}"`
                : "Type a product title to view automated suggestions"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              if (!isCustomMode) {
                setCustomSearch(query || productName);
              }
            }}
            className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-colors flex items-center gap-1 ${
              isCustomMode
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
            title="Search custom keywords"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isCustomMode ? "Sync with Title" : "Search Keywords"}</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || !query.trim()}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center gap-1"
            title="Refresh image suggestions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {onSwitchToMediaTab && (
            <button
              type="button"
              onClick={onSwitchToMediaTab}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1"
              title="Upload from computer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Your Own</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Custom Keyword Search Bar */}
      {isCustomMode && (
        <form onSubmit={handleApplyCustomSearch} className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="e.g. Vintage leather boots, oversized hoodie..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>
      )}

      {/* Suggestions Container */}
      <div className="mt-3">
        {/* Loading Skeletons State */}
        {loading && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Searching relevant images for &quot;{query}&quot;...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-slate-200/80 rounded-xl aspect-square animate-pulse flex flex-col justify-end p-2"
                >
                  <div className="h-3 bg-slate-300 rounded-md w-3/4 mb-1"></div>
                  <div className="h-2 bg-slate-300 rounded-md w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Fallback (Non-blocking) */}
        {!loading && error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            {onSwitchToMediaTab && (
              <button
                type="button"
                onClick={onSwitchToMediaTab}
                className="font-bold text-amber-800 underline hover:text-amber-950 shrink-0"
              >
                Upload from Computer
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && images.length === 0 && query.trim().length >= 2 && (
          <div className="text-center py-6 px-4 bg-white rounded-xl border border-slate-200/80">
            <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No relevant images found for &quot;{query}&quot;</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Try searching a broader term or upload your own high-resolution image.
            </p>
            {onSwitchToMediaTab && (
              <button
                type="button"
                onClick={onSwitchToMediaTab}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Your Own Image
              </button>
            )}
          </div>
        )}

        {/* Suggestions Image Grid */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img) => {
              const isMain = isMainImage(img.url);
              const inGallery = isInGallery(img.url);

              return (
                <div
                  key={img.id}
                  className={`group relative bg-white border rounded-xl overflow-hidden shadow-xs transition-all flex flex-col ${
                    isMain
                      ? "border-indigo-600 ring-2 ring-indigo-500/40"
                      : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={img.thumbnail || img.url}
                      alt={img.alt}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Active State Badges */}
                    {isMain && (
                      <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 z-10">
                        <Check className="w-3 h-3" /> Main Cover
                      </span>
                    )}

                    {inGallery && !isMain && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 z-10">
                        <CheckCircle2 className="w-3 h-3" /> In Gallery
                      </span>
                    )}

                    {/* Quick View Button Overlay */}
                    <button
                      type="button"
                      onClick={() => setPreviewImage(img)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs z-10"
                      title="Preview High-Res Image"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between bg-white">
                    <div className="truncate">
                      <p className="text-[11px] font-bold text-slate-800 truncate" title={img.alt}>
                        {img.alt}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        via {img.source} {img.author ? `• ${img.author}` : ""}
                      </p>
                    </div>

                    {/* Button Group */}
                    <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onSelectMainImage(img.url)}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-colors ${
                          isMain
                            ? "bg-indigo-600 text-white"
                            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                        }`}
                        title="Set as Main Product Cover"
                      >
                        <Check className="w-3 h-3" />
                        <span>{isMain ? "Selected" : "Use Main"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (inGallery && onRemoveGalleryImage) {
                            onRemoveGalleryImage(img.url);
                          } else {
                            onAddGalleryImage(img.url);
                          }
                        }}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
                          inGallery
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                        title={inGallery ? "Remove from Gallery" : "Add to Gallery Images"}
                      >
                        {inGallery ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Gallery</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>+ Gallery</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* High-Resolution Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{previewImage.alt}</h4>
                <p className="text-[11px] text-slate-500">
                  Source: {previewImage.source} {previewImage.author ? `by ${previewImage.author}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square max-h-[360px] flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.alt}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {previewImage.sourceUrl && (
                <a
                  href={previewImage.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>View Original Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    onAddGalleryImage(previewImage.url);
                    setPreviewImage(null);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Add to Gallery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectMainImage(previewImage.url);
                    setPreviewImage(null);
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Use as Main Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

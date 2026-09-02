import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Wand2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
  Download,
  AlertCircle,
  Sliders,
  Maximize2,
  RefreshCw,
  X,
  Upload,
  Palette,
  SunMedium,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  imageEditorService,
  BackgroundSuggestion,
  BackgroundCategory,
  BackgroundRemovalResult,
} from "../../services/imageEditor";

interface ProductImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string; // URL or Data URL
  imageIndex?: number; // -1 for main/primary, 0+ for gallery index
  onApplyImage: (editedImageUrl: string, targetIndex?: number, addToGallery?: boolean) => void;
  productName?: string;
}

export const ProductImageEditorModal: React.FC<ProductImageEditorModalProps> = ({
  isOpen,
  onClose,
  initialImage,
  imageIndex = -1,
  onApplyImage,
  productName = "Product",
}) => {
  // State Management
  const [originalImage, setOriginalImage] = useState<string>(initialImage);
  const [cutoutImage, setCutoutImage] = useState<string | null>(null);
  const [compositedPreview, setCompositedPreview] = useState<string>(initialImage);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("transparent");
  const [selectedCategory, setSelectedCategory] = useState<BackgroundCategory>("all");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [viewMode, setViewMode] = useState<"composite" | "cutout" | "original">("original");

  // Custom Background State
  const [customColor, setCustomColor] = useState<string>("#FFFFFF");
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  // Fine-tuning Controls
  const [productScale, setProductScale] = useState<number>(0.9);
  const [shadowIntensity, setShadowIntensity] = useState<number>(0.35);
  const [tolerance, setTolerance] = useState<number>(28);
  const [edgeFeather, setEdgeFeather] = useState<number>(2);
  const [positionY, setPositionY] = useState<number>(0);

  // Status & Error Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerBadge, setProviderBadge] = useState<string>("Smart Canvas Alpha Matting Engine");
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean>(true);

  const customFileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial image on open
  useEffect(() => {
    if (isOpen && initialImage) {
      setOriginalImage(initialImage);
      setCutoutImage(null);
      setCompositedPreview(initialImage);
      setSelectedPresetId("transparent");
      setViewMode("original");
      setErrorMessage(null);

      // Check service availability
      const available = imageEditorService.isServiceAvailable();
      setIsServiceAvailable(available);
      if (!available) {
        setErrorMessage("Background editing is currently unavailable.");
      }
    }
  }, [isOpen, initialImage]);

  // Presets list
  const presets = useMemo(() => {
    return imageEditorService.getBackgroundPresets(selectedCategory);
  }, [selectedCategory]);

  // Handle Remove Background Trigger
  const handleRemoveBackground = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessStep("Analyzing object boundaries & lighting...");

    try {
      setTimeout(() => {
        setProcessStep("Segmenting subject with edge alpha matting...");
      }, 400);

      const result: BackgroundRemovalResult = await imageEditorService.removeBackground(
        originalImage,
        { tolerance, edgeFeather }
      );

      if (!result.success || !result.cutoutImageUrl) {
        throw new Error(result.error || "Background editing is currently unavailable.");
      }

      setCutoutImage(result.cutoutImageUrl);
      setProviderBadge(result.provider || "Smart Alpha Matting Engine");
      setSelectedPresetId("bg-solid-white"); // Default to clean marketplace white
      setViewMode("composite");
    } catch (err: any) {
      console.error("[Image Editor Modal Error]:", err);
      setErrorMessage(err.message || "Background editing is currently unavailable.");
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  // Re-composite whenever cutout, selected preset, or tuning sliders change
  useEffect(() => {
    if (!cutoutImage) {
      setCompositedPreview(originalImage);
      return;
    }

    let isSubscribed = true;

    const renderComposite = async () => {
      try {
        if (selectedPresetId === "transparent") {
          setCompositedPreview(cutoutImage);
          return;
        }

        let bgToUse: BackgroundSuggestion | string;

        if (selectedPresetId === "custom-color") {
          bgToUse = customColor;
        } else if (selectedPresetId === "custom-upload" && customBgImage) {
          bgToUse = customBgImage;
        } else {
          const found = imageEditorService.getPresetById(selectedPresetId);
          bgToUse = found || "#FFFFFF";
        }

        const compResult = await imageEditorService.compositeImage(cutoutImage, bgToUse, {
          productScale,
          positionY,
          lighting: {
            shadowIntensity,
            shadowBlur: 16,
            shadowOffsetX: 0,
            shadowOffsetY: 14,
            groundReflection: false,
          },
        });

        if (isSubscribed) {
          setCompositedPreview(compResult);
        }
      } catch (err) {
        console.warn("[Compositing error]:", err);
      }
    };

    renderComposite();

    return () => {
      isSubscribed = false;
    };
  }, [
    cutoutImage,
    selectedPresetId,
    customColor,
    customBgImage,
    productScale,
    shadowIntensity,
    positionY,
    originalImage,
  ]);

  // Custom File Background Upload
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = imageEditorService.validateImageFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Invalid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomBgImage(reader.result as string);
      setSelectedPresetId("custom-upload");
    };
    reader.readAsDataURL(file);
  };

  // Handle Apply Actions
  const handleApply = (addToGallery: boolean = false) => {
    const finalUrl = viewMode === "cutout" && cutoutImage ? cutoutImage : compositedPreview;
    onApplyImage(finalUrl, imageIndex, addToGallery);
    onClose();
  };

  // Download directly to local computer
  const handleDownload = () => {
    const finalUrl = viewMode === "cutout" && cutoutImage ? cutoutImage : compositedPreview;
    const link = document.createElement("a");
    link.href = finalUrl;
    link.download = `${productName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-edited.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Product Image Studio & Background Editor
                </h2>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                  {providerBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Extract clean transparent subject cutouts and apply commercial studio backgrounds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR / UNAVAILABLE BANNER */}
        {errorMessage && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* LEFT / CENTER: CANVAS WORKSPACE (lg:col-span-7) */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col items-center justify-between bg-slate-100/60 overflow-y-auto">
            {/* View Mode Switcher */}
            <div className="w-full flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="inline-flex p-1 bg-slate-200/80 rounded-lg text-xs font-medium text-slate-700">
                <button
                  onClick={() => setViewMode("composite")}
                  disabled={!cutoutImage}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "composite" && cutoutImage
                      ? "bg-white text-indigo-700 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-600"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1.5" />
                  Studio Composite
                </button>
                <button
                  onClick={() => setViewMode("cutout")}
                  disabled={!cutoutImage}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "cutout" && cutoutImage
                      ? "bg-white text-indigo-700 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-600"
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5 inline mr-1.5" />
                  Transparent Cutout
                </button>
                <button
                  onClick={() => setViewMode("original")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "original"
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" />
                  Original
                </button>
              </div>

              {cutoutImage && (
                <button
                  onClick={() => {
                    setCutoutImage(null);
                    setViewMode("original");
                    setSelectedPresetId("transparent");
                  }}
                  className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium px-2 py-1 hover:bg-slate-200/60 rounded"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Original
                </button>
              )}
            </div>

            {/* STAGE CANVAS CONTAINER */}
            <div className="relative w-full aspect-square max-w-[420px] rounded-xl overflow-hidden shadow-inner border border-slate-300 flex items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-200">
              {/* Checkerboard layer for transparency */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              />

              {/* Rendered Preview Image */}
              <img
                src={
                  viewMode === "original"
                    ? originalImage
                    : viewMode === "cutout" && cutoutImage
                    ? cutoutImage
                    : compositedPreview
                }
                alt="Product preview"
                className="relative z-10 w-full h-full object-contain select-none transition-transform duration-200"
              />

              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in">
                  <div className="w-12 h-12 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3 shadow-lg" />
                  <p className="text-sm font-semibold tracking-wide">Processing Product Cutout</p>
                  <p className="text-xs text-indigo-200 mt-1 max-w-xs">{processStep}</p>
                </div>
              )}
            </div>

            {/* FINE TUNING TOOLBAR */}
            {cutoutImage && viewMode === "composite" && (
              <div className="w-full mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    Studio Staging Controls
                  </span>
                  <span className="text-[11px] text-slate-400">Scale: {Math.round(productScale * 100)}%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Product Scale */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Product Size</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.2"
                      step="0.05"
                      value={productScale}
                      onChange={(e) => setProductScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Drop Shadow Intensity */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Ground Drop Shadow</span>
                      <span>{Math.round(shadowIntensity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.8"
                      step="0.05"
                      value={shadowIntensity}
                      onChange={(e) => setShadowIntensity(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: ACTIONS & BACKGROUND SUGGESTIONS (lg:col-span-5) */}
          <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-white overflow-y-auto space-y-5">
            {/* STEP 1: BACKGROUND REMOVAL ACTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step 1: Extract Product
                </span>
                {cutoutImage && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Cutout Ready
                  </span>
                )}
              </div>

              {!cutoutImage ? (
                <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Isolate Product Subject</h4>
                  <p className="text-xs text-slate-500 mb-3.5">
                    Instantly strip distracting backgrounds to create a high-resolution transparent PNG.
                  </p>
                  <button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing || !isServiceAvailable}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isProcessing ? "Processing..." : "Remove Background"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Background Removed</p>
                      <p className="text-[11px] text-slate-500">Transparent alpha channel active</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-process
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: BACKGROUND SUGGESTIONS & PRESETS */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step 2: Add / Change Background
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "solid", label: "Solid" },
                    { id: "gradient", label: "Gradients" },
                    { id: "studio", label: "Studio" },
                    { id: "ecommerce", label: "E-Commerce" },
                    { id: "minimal", label: "Minimal" },
                    { id: "lifestyle", label: "Lifestyle" },
                    { id: "custom", label: "Custom" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-56 p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                {/* Transparent Option */}
                <button
                  onClick={() => setSelectedPresetId("transparent")}
                  className={`p-2 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all aspect-4/3 ${
                    selectedPresetId === "transparent"
                      ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-white"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div
                    className="w-full h-12 rounded-lg border border-slate-200 flex items-center justify-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                      backgroundSize: "10px 10px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                      PNG
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 truncate w-full text-center">
                    Transparent
                  </span>
                </button>

                {/* Preset Suggestions */}
                {presets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        if (!cutoutImage) {
                          handleRemoveBackground();
                        }
                      }}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center justify-between gap-1.5 transition-all aspect-4/3 ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      title={preset.description}
                    >
                      <div className="w-full h-12 rounded-lg overflow-hidden border border-slate-200/80 shadow-2xs relative">
                        {preset.type === "color" && (
                          <div className="w-full h-full" style={{ backgroundColor: preset.value }} />
                        )}
                        {preset.type === "gradient" && (
                          <div className="w-full h-full" style={{ background: preset.value }} />
                        )}
                        {preset.type === "image" && (
                          <img
                            src={preset.previewThumbnail}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {preset.badge && (
                          <span className="absolute top-1 right-1 text-[8px] font-bold bg-slate-900/80 text-white px-1 py-0.2 rounded">
                            ★
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-800 truncate w-full text-center">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color / Upload Panel (if custom category or clicked) */}
              {selectedCategory === "custom" && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" /> Custom Background
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedPresetId("custom-color");
                      }}
                      className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0"
                    />
                    <span className="text-xs font-mono text-slate-600 uppercase">{customColor}</span>

                    <div className="ml-auto">
                      <input
                        type="file"
                        ref={customFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleCustomBgUpload}
                      />
                      <button
                        onClick={() => customFileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Upload className="w-3 h-3" /> Upload Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: APPLY ACTIONS */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApply(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  {imageIndex === -1 ? "Save Primary Image" : "Replace Gallery Image"}
                </button>

                <button
                  onClick={() => handleApply(true)}
                  className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 font-semibold text-xs border border-indigo-200 flex items-center justify-center gap-1 transition-all"
                  title="Keep original and append this version to gallery"
                >
                  + Add to Gallery
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  onClick={handleDownload}
                  className="hover:text-slate-900 flex items-center gap-1 transition-colors font-medium"
                >
                  <Download className="w-3.5 h-3.5" /> Download Asset
                </button>
                <button onClick={onClose} className="hover:text-slate-900 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

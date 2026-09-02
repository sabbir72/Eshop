import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Sparkles, Copy, Check, Send, Bot, FileText } from "lucide-react";

export const AdminAIAssistant: React.FC = () => {
  const { products, addToast } = useStore();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [tone, setTone] = useState("Persuasive & Premium");
  const [loading, setLoading] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const prod = products.find((p) => p.id === selectedProductId) || products[0];

  const handleGenerateCopy = async () => {
    if (!prod) return;
    setLoading(true);
    setGeneratedCopy(null);

    try {
      const res = await fetch("/api/ai/copywriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: prod.name,
          category: prod.categoryName,
          keyFeatures: Object.values(prod.specifications || {}).join(", "),
          targetAudience: "Online shoppers seeking high durability and performance",
        }),
      });
      const data = await res.json();
      setGeneratedCopy(data);
    } catch (err) {
      addToast("Failed to connect to AI copywriter endpoint.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast("Copied copywriter output to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">AI Product Copywriter & SEO Generator</h1>
          <p className="text-xs text-indigo-200">Generate high-converting product descriptions, bullet points & meta titles with Gemini AI</p>
        </div>
        <Sparkles className="w-8 h-8 text-indigo-300 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2">Target Product Configuration</h3>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Copywriting Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            >
              <option value="Persuasive & Premium">Persuasive & Premium</option>
              <option value="Urgency & Sales Heavy">Urgency & Sales Heavy</option>
              <option value="Technical & Informative">Technical & Informative</option>
              <option value="Casual & Friendly">Casual & Friendly</option>
            </select>
          </div>

          <button
            onClick={handleGenerateCopy}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> {loading ? "Generating Copy with Gemini AI..." : "Generate AI Marketing Copy"}
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" /> AI Output Preview
          </h3>

          {!generatedCopy && !loading && (
            <p className="text-xs text-slate-400 italic py-12 text-center">
              Select a product and click generate to produce marketing copy.
            </p>
          )}

          {loading && (
            <div className="py-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Writing optimized sales description...</p>
            </div>
          )}

          {generatedCopy && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase">Headline / Tagline</span>
                  <button
                    onClick={() => handleCopyText(generatedCopy.tagline)}
                    className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <p className="text-slate-800 font-bold text-sm">{generatedCopy.tagline}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase">Long Sales Description</span>
                  <button
                    onClick={() => handleCopyText(generatedCopy.longDescription)}
                    className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <p className="text-slate-700 leading-relaxed">{generatedCopy.longDescription}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 uppercase block">Key Selling Points</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {generatedCopy.bulletPoints?.map((bp: string, idx: number) => (
                    <li key={idx}>{bp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

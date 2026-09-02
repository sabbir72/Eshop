import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { exportToCSV, exportToExcel, exportToPDFReport } from "../../utils/exportUtils";
import {
  Search,
  Globe,
  FileText,
  Layers,
  Share2,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Link,
  Bot,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Sparkles,
  Settings,
  Mail,
  Zap,
  Code2,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Filter,
  RefreshCw,
} from "lucide-react";

interface MetaTagItem {
  id: string;
  pageName: string;
  urlPath: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogImage: string;
  seoScore: number;
  status: "Optimized" | "Needs Review" | "Missing Meta";
}

interface BlogArticleItem {
  id: string;
  title: string;
  category: string;
  author: string;
  publishedDate: string;
  status: "Published" | "Draft";
  views: number;
  seoScore: number;
  slug: string;
  image: string;
  excerpt: string;
}

interface RedirectRule {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  type: "301" | "302" | "410";
  hits: number;
  isActive: boolean;
  createdAt: string;
}

export const SEOMarketingManagement: React.FC = () => {
  const { addToast, addAuditLog, products, categories, blogs, addBlogArticle, updateBlogArticle, deleteBlogArticle } = useStore();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "meta" | "blog" | "redirects" | "sitemap" | "schema" | "integrations" | "newsletter"
  >("dashboard");

  // Meta Tags Management State
  const [metaSearch, setMetaSearch] = useState("");
  const [metaPages, setMetaPages] = useState<MetaTagItem[]>([
    {
      id: "m-1",
      pageName: "Homepage",
      urlPath: "/",
      metaTitle: "Buy Official Electronics, Smartphones & Laptops in Bangladesh | Store",
      metaDescription: "Shop 100% authentic gadgets, official warranty iPhones, MacBooks, Samsung phones with express 24h delivery across Bangladesh.",
      metaKeywords: "electronics online bd, buy iphone dhaka, macbook bd price, gadgets bangladesh",
      canonicalUrl: "https://shop.example.com/",
      ogImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80",
      seoScore: 98,
      status: "Optimized",
    },
    {
      id: "m-2",
      pageName: "Smartphones Category",
      urlPath: "/products?category=smartphones",
      metaTitle: "Official Smartphones Price in BD 2026 - Apple, Samsung, Xiaomi",
      metaDescription: "Browse latest smartphones with official warranty. Unbeatable prices on iPhone 15 Pro, Galaxy S24 Ultra & Redmi phones.",
      metaKeywords: "smartphone price bd, official phone bangladesh, mobile shop dhaka",
      canonicalUrl: "https://shop.example.com/products?category=smartphones",
      ogImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
      seoScore: 94,
      status: "Optimized",
    },
    {
      id: "m-3",
      pageName: "Return & Refund Policy",
      urlPath: "/return-policy",
      metaTitle: "Easy 7-Day Replacement & Return Policy - Store",
      metaDescription: "Learn about our hassle-free 7-day return and refund policy for all official electronic items.",
      metaKeywords: "return policy, refund terms, exchange policy",
      canonicalUrl: "https://shop.example.com/return-policy",
      ogImage: "https://images.unsplash.com/photo-1556742049-0a67d5178619?w=1200&q=80",
      seoScore: 88,
      status: "Needs Review",
    },
  ]);

  const [selectedMeta, setSelectedMeta] = useState<MetaTagItem | null>(null);
  const [showMetaModal, setShowMetaModal] = useState(false);

  // Blog Management State
  const [blogSearch, setBlogSearch] = useState("");
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Buying Guide");
  const [blogAuthor, setBlogAuthor] = useState("Tech Editor - Rakib");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState("");

  // Redirect Manager State
  const [redirects, setRedirects] = useState<RedirectRule[]>([
    { id: "r-1", sourceUrl: "/old-iphone-14-page", targetUrl: "/products/p-1", type: "301", hits: 1420, isActive: true, createdAt: "2026-01-10" },
    { id: "r-2", sourceUrl: "/summer-sale-2025", targetUrl: "/offers", type: "302", hits: 380, isActive: true, createdAt: "2026-06-01" },
  ]);
  const [newSource, setNewSource] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newRedType, setNewRedType] = useState<"301" | "302" | "410">("301");

  // Integration Settings
  const [ga4Id, setGa4Id] = useState("G-BD902811XX");
  const [gtmId, setGtmId] = useState("GTM-K9812A");
  const [metaPixelId, setMetaPixelId] = useState("90812984019284");
  const [robotsTxt, setRobotsTxt] = useState(
    `User-agent: *\nDisallow: /admin/\nDisallow: /checkout/\nDisallow: /cart/\nDisallow: /profile/\nSitemap: https://shop.example.com/sitemap.xml`
  );

  // Filtered Meta
  const filteredMeta = useMemo(() => {
    return metaPages.filter(
      (m) =>
        m.pageName.toLowerCase().includes(metaSearch.toLowerCase()) ||
        m.urlPath.toLowerCase().includes(metaSearch.toLowerCase()) ||
        m.metaTitle.toLowerCase().includes(metaSearch.toLowerCase())
    );
  }, [metaPages, metaSearch]);

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeta) return;

    setMetaPages((prev) =>
      prev.map((m) => (m.id === selectedMeta.id ? { ...selectedMeta, status: "Optimized", seoScore: 96 } : m))
    );
    addToast(`Updated SEO Meta tags for ${selectedMeta.pageName}`, "success");
    addAuditLog("CMS", "Edit", `Updated SEO metadata for ${selectedMeta.urlPath}`);
    setShowMetaModal(false);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    const newArt = {
      id: editingBlog ? editingBlog.id : `b-${Date.now()}`,
      title: blogTitle,
      author: blogAuthor,
      date: new Date().toISOString().split("T")[0],
      excerpt: blogExcerpt,
      content: blogContent || "Detailed buying advice and tech review content goes here.",
      image: blogImage || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    };

    if (editingBlog) {
      updateBlogArticle(newArt);
      addToast("Updated Blog Article", "success");
    } else {
      addBlogArticle(newArt);
      addToast("Published New Blog Article", "success");
    }

    setShowBlogModal(false);
    setEditingBlog(null);
  };

  const handleAddRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource || !newTarget) return;

    const newRule: RedirectRule = {
      id: `r-${Date.now()}`,
      sourceUrl: newSource.startsWith("/") ? newSource : `/${newSource}`,
      targetUrl: newTarget,
      type: newRedType,
      hits: 0,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setRedirects((prev) => [newRule, ...prev]);
    addToast(`Added ${newRedType} redirect rule`, "success");
    setNewSource("");
    setNewTarget("");
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Admin Console</span>
            <span>/</span>
            <span>CMS</span>
            <span>/</span>
            <span className="font-bold text-slate-900">Enterprise SEO & Digital Marketing</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-600" />
            SEO, Search Visibility & Digital Marketing Command
          </h1>
          <p className="text-xs text-slate-500">
            Optimize meta tags, structured JSON-LD schemas, blog posts, 301 redirects, XML sitemaps, and tracking pixels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              addToast("Generating AI SEO recommendations...", "info");
              setTimeout(() => addToast("AI SEO Audit complete: 98/100 Health Score!", "success"), 1500);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Run AI SEO Audit</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1 text-xs">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === "dashboard" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> SEO Dashboard
        </button>

        <button
          onClick={() => setActiveTab("meta")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === "meta" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Globe className="w-4 h-4" /> Meta Tags Manager
        </button>

        <button
          onClick={() => setActiveTab("blog")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === "blog" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" /> Blog & Articles ({blogs.length})
        </button>

        <button
          onClick={() => setActiveTab("redirects")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === "redirects" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Link className="w-4 h-4" /> 301 Redirects ({redirects.length})
        </button>

        <button
          onClick={() => setActiveTab("sitemap")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === "sitemap" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Bot className="w-4 h-4" /> Sitemap & Robots.txt
        </button>

        <button
          onClick={() => setActiveTab("schema")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === "schema" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Code2 className="w-4 h-4" /> Schema Manager
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === "integrations" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Zap className="w-4 h-4" /> Analytics & Pixels
        </button>
      </div>

      {/* TAB 1: SEO DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-500">Overall SEO Score</p>
              <p className="text-3xl font-black text-emerald-600">96 / 100</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Google PageSpeed 98+
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-500">Indexed Pages</p>
              <p className="text-3xl font-black text-indigo-900">184 Pages</p>
              <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Verified in Search Console
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-500">Missing Meta Tags</p>
              <p className="text-3xl font-black text-amber-600">2 Items</p>
              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Requires attention
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-500">Monthly Organic Traffic</p>
              <p className="text-3xl font-black text-sky-600">42,800</p>
              <span className="text-[10px] text-sky-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last month
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
                Core Web Vitals & Search Diagnostics
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200">
                  <span className="font-bold">LCP (Largest Contentful Paint)</span>
                  <span className="font-mono font-black">1.1s (Good)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200">
                  <span className="font-bold">FID / INP (Interaction to Next Paint)</span>
                  <span className="font-mono font-black">18ms (Good)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200">
                  <span className="font-bold">CLS (Cumulative Layout Shift)</span>
                  <span className="font-mono font-black">0.002 (Good)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
                Top Performing Keywords (Google BD)
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { kw: "iphone 15 pro max price in bangladesh", rank: "#1", volume: "14,200/mo" },
                  { kw: "official macbook air m3 dhaka", rank: "#2", volume: "8,900/mo" },
                  { kw: "sony wh1000xm5 bd warranty", rank: "#1", volume: "4,100/mo" },
                  { kw: "buy original gadgets online bd", rank: "#3", volume: "12,500/mo" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{item.kw}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Volume: {item.volume}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-black font-mono rounded-lg">
                      {item.rank}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: META TAGS MANAGER */}
      {activeTab === "meta" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={metaSearch}
                onChange={(e) => setMetaSearch(e.target.value)}
                placeholder="Search page URL or meta title..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase">
                <tr>
                  <th className="p-3">Page / Path</th>
                  <th className="p-3">SEO Title</th>
                  <th className="p-3">Meta Description</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredMeta.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.pageName}</p>
                      <p className="font-mono text-[10px] text-indigo-600">{item.urlPath}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{item.metaTitle}</td>
                    <td className="p-3 text-slate-500 max-w-sm truncate">{item.metaDescription}</td>
                    <td className="p-3 font-mono font-black text-emerald-600">{item.seoScore}/100</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedMeta(item);
                          setShowMetaModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-xs"
                      >
                        Edit SEO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BLOG MANAGER */}
      {activeTab === "blog" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <h3 className="font-black text-sm text-slate-900">Blog Articles & Buying Guides</h3>
            <button
              onClick={() => {
                setEditingBlog(null);
                setBlogTitle("");
                setBlogExcerpt("");
                setBlogContent("");
                setBlogImage("");
                setShowBlogModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Blog Article
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((b) => (
              <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <img src={b.image} alt={b.title} className="w-full h-36 object-cover rounded-xl border bg-white" />
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[10px] rounded-full">
                    Buying Guide
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-xs line-clamp-2">{b.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{b.excerpt}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>By {b.author}</span>
                  <button
                    onClick={() => {
                      setEditingBlog(b);
                      setBlogTitle(b.title);
                      setBlogExcerpt(b.excerpt);
                      setBlogContent(b.content);
                      setBlogImage(b.image);
                      setShowBlogModal(true);
                    }}
                    className="p-1.5 hover:bg-white text-indigo-600 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REDIRECT MANAGER */}
      {activeTab === "redirects" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleAddRedirect} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase">Add New URL Redirect Rule</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Source URL Slug</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="/old-product-slug"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Target Destination URL</label>
                <input
                  type="text"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="/products/p-1"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Redirect Code</label>
                <select
                  value={newRedType}
                  onChange={(e) => setNewRedType(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="301">301 Permanent Redirect</option>
                  <option value="302">302 Temporary Redirect</option>
                  <option value="410">410 Content Gone</option>
                </select>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
              Save Redirect Rule
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase">
                <tr>
                  <th className="p-3">Source URL</th>
                  <th className="p-3">Target URL</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Hits</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {redirects.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-mono text-slate-900 font-bold">{r.sourceUrl}</td>
                    <td className="p-3 font-mono text-indigo-600">{r.targetUrl}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-black text-[10px] rounded-md">{r.type}</span></td>
                    <td className="p-3 font-mono font-bold text-slate-700">{r.hits} requests</td>
                    <td className="p-3 text-center">
                      <button onClick={() => setRedirects((prev) => prev.filter((i) => i.id !== r.id))} className="p-1 hover:bg-rose-50 text-rose-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SITEMAP & ROBOTS.TXT */}
      {activeTab === "sitemap" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Dynamic XML Sitemap</span>
              <button onClick={() => addToast("Generated sitemap.xml with 184 URLs", "success")} className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl">
                Rebuild XML
              </button>
            </h3>
            <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto max-h-60 space-y-1">
              <p>&lt;?xml version="1.0" encoding="UTF-8"?&gt;</p>
              <p>&lt;urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"&gt;</p>
              <p className="pl-4">&lt;url&gt;&lt;loc&gt;https://shop.example.com/&lt;/loc&gt;&lt;priority&gt;1.0&lt;/priority&gt;&lt;/url&gt;</p>
              <p className="pl-4">&lt;url&gt;&lt;loc&gt;https://shop.example.com/products&lt;/loc&gt;&lt;priority&gt;0.9&lt;/priority&gt;&lt;/url&gt;</p>
              <p>&lt;/urlset&gt;</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">Robots.txt Configuration</h3>
            <textarea
              rows={8}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full p-3 bg-slate-950 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none"
            />
            <button onClick={() => addToast("Saved Robots.txt file", "success")} className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
              Save Robots.txt
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: SCHEMA MANAGER */}
      {activeTab === "schema" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">JSON-LD Structured Data Preview</h3>
          <div className="p-4 bg-slate-950 text-amber-300 font-mono text-xs rounded-2xl overflow-x-auto max-h-72">
            <pre>{JSON.stringify(
              {
                "@context": "https://schema.org/",
                "@type": "Product",
                name: products[0]?.name || "iPhone 15 Pro Max",
                image: [products[0]?.mainImage],
                description: products[0]?.shortDescription,
                sku: products[0]?.sku,
                brand: { "@type": "Brand", name: "Apple" },
                offers: {
                  "@type": "Offer",
                  priceCurrency: "BDT",
                  price: products[0]?.sellingPrice || 145000,
                  availability: "https://schema.org/InStock",
                },
              },
              null,
              2
            )}</pre>
          </div>
        </div>
      )}

      {/* TAB 7: INTEGRATIONS */}
      {activeTab === "integrations" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">Analytics & Social Tracking Pixels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Google Analytics 4 (GA4 ID)</label>
              <input type="text" value={ga4Id} onChange={(e) => setGa4Id(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Google Tag Manager (GTM ID)</label>
              <input type="text" value={gtmId} onChange={(e) => setGtmId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Meta Pixel ID (Facebook / IG)</label>
              <input type="text" value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900" />
            </div>
          </div>
          <button onClick={() => addToast("Saved tracking pixels configuration", "success")} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
            Save Integrations
          </button>
        </div>
      )}

      {/* EDIT META MODAL */}
      {showMetaModal && selectedMeta && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-left text-xs">
            <h3 className="font-black text-base text-slate-900">Edit Meta Tags for {selectedMeta.pageName}</h3>
            <form onSubmit={handleSaveMeta} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">SEO Title Tag (50-60 chars)</label>
                <input
                  type="text"
                  value={selectedMeta.metaTitle}
                  onChange={(e) => setSelectedMeta({ ...selectedMeta, metaTitle: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meta Description (150-160 chars)</label>
                <textarea
                  rows={3}
                  value={selectedMeta.metaDescription}
                  onChange={(e) => setSelectedMeta({ ...selectedMeta, metaDescription: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={selectedMeta.canonicalUrl}
                  onChange={(e) => setSelectedMeta({ ...selectedMeta, canonicalUrl: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowMetaModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md">
                  Save Meta Tags
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BLOG MODAL */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-left text-xs">
            <h3 className="font-black text-base text-slate-900">{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</h3>
            <form onSubmit={handleSaveBlog} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Article Title</label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Top 10 Best Smartphones to Buy in Bangladesh 2026"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Featured Image URL</label>
                <input
                  type="text"
                  value={blogImage}
                  onChange={(e) => setBlogImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="Short summary for preview card..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowBlogModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md">
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

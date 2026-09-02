import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { Category, Product } from "../../types";
import { t, translateDynamic } from "../../utils/i18n";
import {
  ChevronDown,
  ChevronRight,
  Grid,
  Sparkles,
  ArrowRight,
  Smartphone,
  Laptop,
  Watch,
  Camera,
  Shirt,
  User,
  Heart,
  Smile,
  Footprints,
  Home,
  Armchair,
  Utensils,
  ShoppingBag,
  Apple,
  Coffee,
  HeartPulse,
  Trophy,
  BookOpen,
  Gamepad,
  Car,
  Briefcase,
  Dog,
  Layers,
  ShoppingBag as StoreIcon,
} from "lucide-react";

// Icon mapping helper
const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case "Smartphone":
      return <Smartphone className="w-4 h-4" />;
    case "Laptop":
      return <Laptop className="w-4 h-4" />;
    case "Watch":
      return <Watch className="w-4 h-4" />;
    case "Camera":
      return <Camera className="w-4 h-4" />;
    case "Shirt":
      return <Shirt className="w-4 h-4" />;
    case "User":
      return <User className="w-4 h-4" />;
    case "Heart":
      return <Heart className="w-4 h-4" />;
    case "Smile":
      return <Smile className="w-4 h-4" />;
    case "Footprints":
      return <Footprints className="w-4 h-4" />;
    case "Home":
      return <Home className="w-4 h-4" />;
    case "Armchair":
      return <Armchair className="w-4 h-4" />;
    case "Utensils":
      return <Utensils className="w-4 h-4" />;
    case "ShoppingBag":
      return <ShoppingBag className="w-4 h-4" />;
    case "Apple":
      return <Apple className="w-4 h-4" />;
    case "Coffee":
      return <Coffee className="w-4 h-4" />;
    case "HeartPulse":
      return <HeartPulse className="w-4 h-4" />;
    case "Trophy":
      return <Trophy className="w-4 h-4" />;
    case "BookOpen":
      return <BookOpen className="w-4 h-4" />;
    case "Gamepad":
      return <Gamepad className="w-4 h-4" />;
    case "Car":
      return <Car className="w-4 h-4" />;
    case "Briefcase":
      return <Briefcase className="w-4 h-4" />;
    case "Dog":
      return <Dog className="w-4 h-4" />;
    default:
      return null;
  }
};

const getCategoryIconByName = (catName: string, iconName?: string) => {
  if (iconName) {
    const explicit = getCategoryIcon(iconName);
    if (explicit) return explicit;
  }
  const lower = catName.toLowerCase();
  if (lower.includes("mobile") || lower.includes("phone") || lower.includes("android") || lower.includes("iphone")) {
    return <Smartphone className="w-4 h-4" />;
  }
  if (lower.includes("laptop") || lower.includes("computer") || lower.includes("pc") || lower.includes("macbook")) {
    return <Laptop className="w-4 h-4" />;
  }
  if (lower.includes("watch") || lower.includes("wearable")) {
    return <Watch className="w-4 h-4" />;
  }
  if (lower.includes("camera") || lower.includes("photo") || lower.includes("dslr")) {
    return <Camera className="w-4 h-4" />;
  }
  if (lower.includes("electronic") || lower.includes("gadget") || lower.includes("tech")) {
    return <Smartphone className="w-4 h-4" />;
  }
  if (lower.includes("men") && !lower.includes("women")) {
    return <User className="w-4 h-4" />;
  }
  if (lower.includes("women") || lower.includes("lady") || lower.includes("ladies")) {
    return <ShoppingBag className="w-4 h-4" />;
  }
  if (lower.includes("fashion") || lower.includes("cloth") || lower.includes("wear") || lower.includes("apparel") || lower.includes("shirt")) {
    return <Shirt className="w-4 h-4" />;
  }
  if (lower.includes("home") || lower.includes("living") || lower.includes("appliance")) {
    return <Home className="w-4 h-4" />;
  }
  if (lower.includes("furniture") || lower.includes("decor")) {
    return <Armchair className="w-4 h-4" />;
  }
  if (lower.includes("auto") || lower.includes("car") || lower.includes("bike") || lower.includes("vehicle")) {
    return <Car className="w-4 h-4" />;
  }
  if (lower.includes("book") || lower.includes("stationery") || lower.includes("novel")) {
    return <BookOpen className="w-4 h-4" />;
  }
  if (lower.includes("sport") || lower.includes("outdoor") || lower.includes("gym") || lower.includes("fitness")) {
    return <Trophy className="w-4 h-4" />;
  }
  if (lower.includes("beauty") || lower.includes("health") || lower.includes("cosmetic") || lower.includes("care")) {
    return <HeartPulse className="w-4 h-4" />;
  }
  if (lower.includes("jewelry") || lower.includes("jewel") || lower.includes("gold") || lower.includes("ring")) {
    return <Sparkles className="w-4 h-4" />;
  }
  if (lower.includes("bag") || lower.includes("luggage") || lower.includes("backpack")) {
    return <Briefcase className="w-4 h-4" />;
  }
  if (lower.includes("pet") || lower.includes("dog") || lower.includes("cat")) {
    return <Dog className="w-4 h-4" />;
  }
  return <Layers className="w-4 h-4" />;
};

interface CategoryMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({ isOpen, onClose, onToggle }) => {
  const { categories, products, setSelectedCategoryId, setStoreView, language, addToCart } = useStore();
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active top-level parent categories
  const parentCategories = categories
    .filter((c) => !c.parentId && c.status === "Active")
    .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  const firstParentId = parentCategories[0]?.id;

  // Default to first active parent category when opened
  useEffect(() => {
    if (isOpen && !activeParentId && firstParentId) {
      setActiveParentId(firstParentId);
    }
  }, [isOpen, firstParentId, activeParentId]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const activeParent = categories.find((c) => c.id === activeParentId) || parentCategories[0];

  // Direct subcategories of active parent
  const subCategories = categories
    .filter((c) => c.parentId === activeParent?.id && c.status === "Active")
    .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  // Featured product in active parent
  const featuredProduct = activeParent
    ? products.find((p) => p.categoryId === activeParent.id || subCategories.some((sub) => sub.id === p.subCategoryId))
    : null;

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setStoreView("products");
    onClose();
  };

  const handleViewAll = () => {
    setSelectedCategoryId(null);
    setStoreView("categories");
    onClose();
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Mega Menu Trigger Button */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs tracking-wide transition-all duration-200 border shadow-xs ${
          isOpen
            ? "bg-indigo-600 text-white border-indigo-700 shadow-indigo-200"
            : "bg-slate-900 hover:bg-indigo-600 text-white border-slate-800 hover:border-indigo-500"
        }`}
      >
        <Grid className="w-4 h-4 text-amber-400" />
        <span>{t("all_categories", language)}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Mega Menu Overlay Box */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-[92vw] max-w-5xl bg-white border border-slate-200/80 rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-2"
          style={{ transitionDuration: "150ms" }}
        >
          <div className="grid grid-cols-12 min-h-[420px] max-h-[560px]">
            {/* Sidebar Column: Parent Categories List */}
            <div className="col-span-4 md:col-span-3 bg-slate-50 border-r border-slate-200 p-3 overflow-y-auto space-y-1">
              <div className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span>{t("all_categories", language)}</span>
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold text-[9px]">
                  {parentCategories.length}
                </span>
              </div>

              {parentCategories.map((cat) => {
                const isActive = cat.id === activeParentId;
                const childCount = categories.filter((c) => c.parentId === cat.id && c.status === "Active").length;

                return (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveParentId(cat.id)}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50 scale-[1.01]"
                        : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`p-1.5 rounded-xl ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                        {getCategoryIconByName(cat.name, cat.icon)}
                      </span>
                      <span className="truncate">{translateDynamic(cat.name, cat.name_bn, language)}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {childCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "text-slate-400"}`}>
                          {childCount}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main Content Area: Subcategories Columns & Category Showcase */}
            <div className="col-span-8 md:col-span-9 p-6 flex flex-col justify-between overflow-y-auto bg-white">
              {activeParent && (
                <div>
                  {/* Category Banner Header */}
                  <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between shadow-md">
                    {activeParent.bannerImage || activeParent.banner ? (
                      <img
                        src={activeParent.bannerImage || activeParent.banner}
                        alt={activeParent.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-25"
                      />
                    ) : null}
                    <div className="relative z-10 space-y-1 max-w-md">
                      <span className="inline-block px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider">
                        Featured Category
                      </span>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        {translateDynamic(activeParent.name, activeParent.name_bn, language)}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1 font-medium">
                        {translateDynamic(activeParent.description, activeParent.description_bn, language)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectCategory(activeParent.id)}
                      className="relative z-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 group shrink-0"
                    >
                      <span>{t("shop_all", language)}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Subcategories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {subCategories.length > 0 ? (
                      subCategories.map((sub) => {
                        // Grandchild categories (nested level 3)
                        const grandChildren = categories.filter((c) => c.parentId === sub.id && c.status === "Active");

                        return (
                          <div key={sub.id} className="space-y-2">
                            <button
                              onClick={() => handleSelectCategory(sub.id)}
                              className="font-extrabold text-xs text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5 group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 group-hover:scale-150 transition-transform"></span>
                              <span>{translateDynamic(sub.name, sub.name_bn, language)}</span>
                            </button>

                            {/* Grandchildren sub-items */}
                            {grandChildren.length > 0 && (
                              <ul className="pl-3.5 space-y-1.5 border-l border-slate-100">
                                {grandChildren.map((gc) => (
                                  <li key={gc.id}>
                                    <button
                                      onClick={() => handleSelectCategory(gc.id)}
                                      className="text-xs text-slate-500 hover:text-slate-900 transition-colors line-clamp-1"
                                    >
                                      {translateDynamic(gc.name, gc.name_bn, language)}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-3 text-slate-400 text-xs py-4 font-medium italic">
                        Explore all authentic items in {translateDynamic(activeParent.name, activeParent.name_bn, language)}.
                      </div>
                    )}
                  </div>

                  {/* Optional Featured Product Preview Card inside Mega Menu */}
                  {featuredProduct && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={featuredProduct.mainImage}
                          alt={featuredProduct.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                            Top Recommendation
                          </span>
                          <span className="text-xs font-bold text-slate-900 line-clamp-1">
                            {translateDynamic(featuredProduct.name, featuredProduct.name_bn, language)}
                          </span>
                          <span className="text-xs font-black text-slate-900">৳{featuredProduct.sellingPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(featuredProduct)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                      >
                        {t("add_to_cart", language)}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Footer Actions */}
              <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium">
                  Showing <strong className="text-slate-900 font-extrabold">{parentCategories.length}</strong> top-level category departments
                </div>

                <button
                  onClick={handleViewAll}
                  className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("view_all_categories", language)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

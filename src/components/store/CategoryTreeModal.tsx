import React from "react";
import { useStore } from "../../context/StoreContext";
import { Category } from "../../types";
import { Folder, ChevronRight, Layers, ArrowRight } from "lucide-react";

export const CategoryTreeModal: React.FC = () => {
  const { categories, setSelectedCategoryId, setStoreView } = useStore();

  // Separate root categories
  const rootCategories = categories.filter((c) => c.parentId === null);

  const getSubcategories = (parentId: string) => {
    return categories.filter((c) => c.parentId === parentId);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Categories Hierarchy</h1>
          <p className="text-xs text-slate-300">Browse unlimited nested categories and subcategories</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rootCategories.map((rootCat) => {
          const level1 = getSubcategories(rootCat.id);

          return (
            <div key={rootCat.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <img src={rootCat.image} alt={rootCat.name} className="w-12 h-12 rounded-xl object-cover border" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-base">{rootCat.name}</h3>
                  <p className="text-xs text-slate-500">{rootCat.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategoryId(rootCat.id);
                    setStoreView("products");
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs p-2 rounded-xl"
                  title="View Category"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Subcategories Level 1 */}
              <div className="space-y-2 pl-2 border-l-2 border-slate-100">
                {level1.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No subcategories</p>
                ) : (
                  level1.map((sub1) => {
                    const level2 = getSubcategories(sub1.id);

                    return (
                      <div key={sub1.id} className="space-y-1.5 pt-1">
                        <button
                          onClick={() => {
                            setSelectedCategoryId(sub1.id);
                            setStoreView("products");
                          }}
                          className="w-full text-left font-bold text-xs text-slate-800 hover:text-blue-600 flex items-center gap-2 group"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                          <span>{sub1.name}</span>
                        </button>

                        {/* Level 2 Subcategories */}
                        {level2.length > 0 && (
                          <div className="pl-6 space-y-1 flex flex-wrap gap-1.5">
                            {level2.map((sub2) => (
                              <button
                                key={sub2.id}
                                onClick={() => {
                                  setSelectedCategoryId(sub2.id);
                                  setStoreView("products");
                                }}
                                className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                              >
                                {sub2.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

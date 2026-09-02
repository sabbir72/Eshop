import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Category } from "../../types";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Folder,
  X,
  Search,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  EyeOff,
  AlertTriangle,
  FolderTree,
} from "lucide-react";

export const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, hasPermission, addToast, recordAuditLog } = useStore();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [name_bn, setNameBn] = useState("");
  const [parentId, setParentId] = useState<string | null>("none");
  const [description, setDescription] = useState("");
  const [description_bn, setDescriptionBn] = useState("");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80");
  const [bannerImage, setBannerImage] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setNameBn("");
    setParentId("none");
    setDescription("Category for tech, gadgets and smart appliances");
    setDescriptionBn("");
    setImage("https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80");
    setBannerImage("");
    setSlug("");
    setStatus("Active");
    setDisplayOrder(categories.length + 1);
    setSeoTitle("Buy Quality Products Online");
    setSeoKeywords("ecommerce, online shopping, electronics");
    setSeoDescription("Explore top deal categories");
    setShowModal(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setNameBn(cat.name_bn || "");
    setParentId(cat.parentId || "none");
    setDescription(cat.description || "");
    setDescriptionBn(cat.description_bn || "");
    setImage(cat.image || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80");
    setBannerImage(cat.bannerImage || "");
    setSlug(cat.slug);
    setStatus(cat.status || "Active");
    setDisplayOrder(cat.displayOrder || 1);
    setSeoTitle(cat.seoTitle || "");
    setSeoKeywords(cat.seoKeywords || "");
    setSeoDescription(cat.seoDescription || "");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast("Category Name is required.", "error");
      return;
    }

    const payload = {
      name: name.trim(),
      name_bn: name_bn.trim(),
      parentId: parentId === "none" ? null : parentId,
      description: description.trim(),
      description_bn: description_bn.trim(),
      image,
      bannerImage,
      slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"),
      status,
      displayOrder,
      seoTitle,
      seoKeywords,
      seoDescription,
    };

    if (editingId) {
      updateCategory(editingId, payload);
      recordAuditLog(`Updated Category '${name}'`, "Category", "", JSON.stringify(payload));
    } else {
      addCategory(payload);
      recordAuditLog(`Created Category '${name}'`, "Category", "", JSON.stringify(payload));
    }

    setShowModal(false);
  };

  const handleToggleStatus = (cat: Category) => {
    const nextStatus = cat.status === "Active" ? "Inactive" : "Active";
    updateCategory(cat.id, { status: nextStatus });
    recordAuditLog(`Toggled status for Category '${cat.name}' to ${nextStatus}`, "Category");
  };

  const handleReorder = (cat: Category, direction: "up" | "down") => {
    const currentOrder = cat.displayOrder || 1;
    const newOrder = direction === "up" ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    updateCategory(cat.id, { displayOrder: newOrder });
  };

  const handleConfirmDelete = () => {
    if (!deletingCat) return;
    deleteCategory(deletingCat.id);
    recordAuditLog(`Deleted Category '${deletingCat.name}'`, "Category");
    setDeletingCat(null);
  };

  // Filter categories
  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight">Category & Subcategory Hierarchy</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">Create unlimited subcategories, organize reordering & manage active visibility</p>
        </div>

        {hasPermission("Category", "add") && (
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Category
          </button>
        )}
      </div>

      {/* Toolbar Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Categories or Subcategories..."
            className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Total Categories: <strong className="text-slate-900">{categories.length}</strong>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Category Name</th>
                <th className="p-3">Hierarchy Level</th>
                <th className="p-3">Slug</th>
                <th className="p-3 text-center">Display Order</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    No categories found matching search.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const parentCat = categories.find((c) => c.id === cat.parentId);
                  const isSub = !!parentCat;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className={`flex items-center gap-3 ${isSub ? "ml-6 border-l-2 border-indigo-200 pl-3" : ""}`}>
                          <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                          <div>
                            <span className="font-extrabold text-slate-900 block">{cat.name}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{cat.description}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-semibold">
                        {isSub ? (
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-indigo-200">
                            Subcategory of {parentCat.name}
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                            Root Parent Category
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-mono text-slate-600">{cat.slug}</td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border">
                          <button
                            onClick={() => handleReorder(cat, "up")}
                            className="p-0.5 hover:bg-slate-200 rounded text-slate-600"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-slate-900 text-xs px-1">{cat.displayOrder || 1}</span>
                          <button
                            onClick={() => handleReorder(cat, "down")}
                            className="p-0.5 hover:bg-slate-200 rounded text-slate-600"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase transition-all ${
                            cat.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-rose-50 text-rose-700 border-rose-300"
                          }`}
                        >
                          {cat.status || "Active"}
                        </button>
                      </td>

                      <td className="p-3 text-right space-x-1">
                        {hasPermission("Category", "edit") && (
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission("Category", "delete") && (
                          <button
                            onClick={() => setDeletingCat(cat)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingId ? "Edit Category Details" : "Create New Category / Subcategory"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smart Phones or Audio Wearables"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-indigo-700 block mb-1">Category Name (Bangla / বাংলা)</label>
                <input
                  type="text"
                  value={name_bn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: স্মার্টফোন বা ইলেকট্রনিক্স"
                  className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl p-2.5 font-bold text-indigo-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Category (For Subcategories)</label>
                <select
                  value={parentId || "none"}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  <option value="none">None (Root Top-Level Category)</option>
                  {categories
                    .filter((c) => c.id !== editingId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-if-empty"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-indigo-700 block mb-1">Description (Bangla / বাংলা)</label>
                <textarea
                  rows={2}
                  value={description_bn}
                  onChange={(e) => setDescriptionBn(e.target.value)}
                  placeholder="ক্যাটাগরির বিবরণ বাংলায় লিখুন..."
                  className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl p-2.5 text-indigo-950"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SEO Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Buy Premium Smart Phones Online"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b pb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-slate-900 text-base">Delete Category</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete category <strong className="text-slate-900">"{deletingCat.name}"</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingCat(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

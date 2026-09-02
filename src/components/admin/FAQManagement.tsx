import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  FolderPlus,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Search,
} from "lucide-react";
import { FAQCategory, FAQItemExt } from "../../types";

export const FAQManagement: React.FC = () => {
  const {
    faqCategories,
    addFAQCategory,
    updateFAQCategory,
    deleteFAQCategory,
    faqItemsExt,
    addFAQExt,
    updateFAQExt,
    deleteFAQExt,
    hasPermission,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"questions" | "categories">("questions");

  // Question Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(faqCategories[0]?.id || "");
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catIcon, setCatIcon] = useState("HelpCircle");

  const [searchQuery, setSearchQuery] = useState("");

  const canEdit = hasPermission("CMS", "edit");
  const canDelete = hasPermission("CMS", "delete");

  const openNewQuestionModal = () => {
    setEditingFaqId(null);
    setCategoryId(faqCategories[0]?.id || "");
    setQuestionText("");
    setAnswerText("");
    setIsPublished(true);
    setShowQuestionModal(true);
  };

  const openEditQuestionModal = (item: FAQItemExt) => {
    setEditingFaqId(item.id);
    setCategoryId(item.categoryId);
    setQuestionText(item.question);
    setAnswerText(item.answer);
    setIsPublished(item.isPublished);
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = faqCategories.find((c) => c.id === categoryId);
    const catName = cat ? cat.name : "General";

    if (editingFaqId) {
      updateFAQExt(editingFaqId, {
        categoryId,
        categoryName: catName,
        question: questionText,
        answer: answerText,
        isPublished,
      });
    } else {
      addFAQExt({
        categoryId,
        categoryName: catName,
        question: questionText,
        answer: answerText,
        isPublished,
      });
    }
    setShowQuestionModal(false);
  };

  const openNewCategoryModal = () => {
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setCatIcon("HelpCircle");
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat: FAQCategory) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatIcon(cat.icon || "HelpCircle");
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCatId) {
      updateFAQCategory(editingCatId, {
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/\s+/g, "-"),
        icon: catIcon,
      });
    } else {
      addFAQCategory({
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/\s+/g, "-"),
        icon: catIcon,
      });
    }
    setShowCategoryModal(false);
  };

  const filteredFaqs = faqItemsExt.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-indigo-600" />
            FAQ & Help Knowledge Base
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Organize customer support categories and manage answer articles with voting statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "questions"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              FAQ Questions ({faqItemsExt.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "categories"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Categories ({faqCategories.length})
            </button>
          </div>

          {canEdit && (
            <button
              onClick={activeTab === "questions" ? openNewQuestionModal : openNewCategoryModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />{" "}
              {activeTab === "questions" ? "Add Question" : "Add Category"}
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: QUESTIONS LIST */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search FAQ questions or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                    <th className="p-4">Category</th>
                    <th className="p-4">Question & Answer</th>
                    <th className="p-4">Feedback Votes</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredFaqs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No FAQ items found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredFaqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                            {faq.categoryName}
                          </span>
                        </td>

                        <td className="p-4 max-w-md">
                          <div className="font-bold text-slate-900">{faq.question}</div>
                          <div className="text-xs text-slate-600 line-clamp-2 mt-1">{faq.answer}</div>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                              <ThumbsUp className="w-3.5 h-3.5" /> {faq.helpfulCount}
                            </span>
                            <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                              <ThumbsDown className="w-3.5 h-3.5" /> {faq.notHelpfulCount}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              faq.isPublished
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {faq.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditQuestionModal(faq)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => deleteFAQExt(faq.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES LIST */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {faqCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-mono text-slate-400">/help/{cat.slug}</span>
                <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Questions: {faqItemsExt.filter((f) => f.categoryId === cat.id).length}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditCategoryModal(cat)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {canDelete && (
                  <button
                    onClick={() => deleteFAQCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUESTION MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveQuestion}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingFaqId ? "Edit FAQ Question" : "Add New FAQ Question"}
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  FAQ Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none bg-white"
                  required
                >
                  {faqCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. How can I track my package live?"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Answer Text / Guide
                </label>
                <textarea
                  rows={4}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Detailed resolution instructions..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-700">Publish to Help Center</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                Save Question
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingCatId ? "Edit Category" : "Add New FAQ Category"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Orders & Shipping"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Slug / URL Path
                </label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. orders-shipping"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

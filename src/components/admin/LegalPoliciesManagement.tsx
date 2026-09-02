import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  Edit2,
  History,
  Save,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { PolicyDocument, PolicySection } from "../../types";

export const LegalPoliciesManagement: React.FC = () => {
  const {
    privacyPolicy,
    updatePrivacyPolicy,
    termsConditions,
    updateTermsConditions,
    returnPolicy,
    updateReturnPolicy,
    hasPermission,
  } = useStore();

  const [activeDoc, setActiveDoc] = useState<"privacy" | "terms" | "return">("privacy");

  // Active Policy Form
  const currentPolicy: PolicyDocument =
    activeDoc === "privacy"
      ? privacyPolicy
      : activeDoc === "terms"
      ? termsConditions
      : returnPolicy;

  const [sections, setSections] = useState<PolicySection[]>(currentPolicy.sections);
  const [versionNotes, setVersionNotes] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionContent, setSectionContent] = useState("");

  const canEdit = hasPermission("CMS", "edit");

  // Switch policy handler
  const handleSwitchDoc = (docType: "privacy" | "terms" | "return") => {
    setActiveDoc(docType);
    const target =
      docType === "privacy"
        ? privacyPolicy
        : docType === "terms"
        ? termsConditions
        : returnPolicy;
    setSections(target.sections);
    setVersionNotes("");
    setEditingSectionId(null);
    setSectionTitle("");
    setSectionContent("");
  };

  const handleSaveSection = () => {
    if (!sectionTitle.trim() || !sectionContent.trim()) return;

    if (editingSectionId) {
      setSections(
        sections.map((s) =>
          s.id === editingSectionId
            ? { ...s, title: sectionTitle, content: sectionContent }
            : s
        )
      );
    } else {
      const newSec: PolicySection = {
        id: `sec-${Date.now()}`,
        title: sectionTitle,
        content: sectionContent,
      };
      setSections([...sections, newSec]);
    }

    setEditingSectionId(null);
    setSectionTitle("");
    setSectionContent("");
  };

  const handleEditSectionClick = (sec: PolicySection) => {
    setEditingSectionId(sec.id);
    setSectionTitle(sec.title);
    setSectionContent(sec.content);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handlePublishPolicyUpdate = () => {
    const updatedDoc: Partial<PolicyDocument> = {
      title: currentPolicy.title,
      sections,
    };

    if (activeDoc === "privacy") {
      updatePrivacyPolicy(updatedDoc, versionNotes || "Routine policy content review");
    } else if (activeDoc === "terms") {
      updateTermsConditions(updatedDoc, versionNotes || "Routine terms content review");
    } else {
      updateReturnPolicy(updatedDoc, versionNotes || "Routine return policy content review");
    }

    setVersionNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Policy Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Legal Policies & Governance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage Privacy Policy, Terms & Conditions, and Return & Refund Rules with full version history.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => handleSwitchDoc("privacy")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeDoc === "privacy"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => handleSwitchDoc("terms")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeDoc === "terms"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => handleSwitchDoc("return")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeDoc === "return"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Return Policy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Document Sections Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase">
                  Version {currentPolicy.version}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{currentPolicy.title}</h2>
                <p className="text-xs text-slate-400">Last Published: {currentPolicy.updatedAt}</p>
              </div>

              {canEdit && (
                <button
                  onClick={handlePublishPolicyUpdate}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm transition"
                >
                  <Save className="w-4 h-4" /> Publish New Version
                </button>
              )}
            </div>

            {/* Version Change Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Version Release Notes / Summary of Changes
              </label>
              <input
                type="text"
                placeholder="e.g. Updated return pickup timeline and cookie consent details"
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Section Add/Edit Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
                <span>{editingSectionId ? "Edit Section" : "Add New Policy Section"}</span>
                {editingSectionId && (
                  <button
                    onClick={() => {
                      setEditingSectionId(null);
                      setSectionTitle("");
                      setSectionContent("");
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-normal"
                  >
                    Cancel Edit
                  </button>
                )}
              </h4>

              <input
                type="text"
                placeholder="Section Heading Title (e.g. 1. Data Collection Guidelines)"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2 text-sm outline-none"
              />

              <textarea
                rows={4}
                placeholder="Section paragraph content..."
                value={sectionContent}
                onChange={(e) => setSectionContent(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl p-3 text-sm outline-none"
              />

              <button
                type="button"
                onClick={handleSaveSection}
                disabled={!sectionTitle.trim() || !sectionContent.trim()}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> {editingSectionId ? "Update Section" : "Add Section"}
              </button>
            </div>

            {/* Sections Display */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase">Document Sections ({sections.length})</h3>
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{sec.title}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSectionClick(sec)}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{sec.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Version History Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
              <History className="w-5 h-5 text-indigo-600" /> Version Audit Trail
            </h3>

            <div className="space-y-3">
              {currentPolicy.history.map((ver, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700">v{ver.version}</span>
                    <span className="text-slate-400">{ver.updatedAt}</span>
                  </div>
                  <div className="text-slate-700 font-medium">By: {ver.updatedBy}</div>
                  <p className="text-slate-500 italic">"{ver.notes}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

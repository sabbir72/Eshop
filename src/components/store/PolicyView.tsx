import React from "react";
import { useStore } from "../../context/StoreContext";
import { ShieldCheck, FileText, RotateCcw, Printer, ArrowLeft } from "lucide-react";
import { PolicyDocument } from "../../types";

interface PolicyViewProps {
  type: "privacy" | "terms" | "return";
}

export const PolicyView: React.FC<PolicyViewProps> = ({ type }) => {
  const { privacyPolicy, termsConditions, returnPolicy, setStoreView } = useStore();

  const doc: PolicyDocument =
    type === "privacy"
      ? privacyPolicy
      : type === "terms"
      ? termsConditions
      : returnPolicy;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back and Action Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStoreView("home")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print / Save PDF
          </button>
        </div>

        {/* Policy Document Card */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 space-y-8">
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase">
                Official Policy Document
              </span>
              <span className="text-xs text-slate-400 font-mono">Version {doc.version}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">{doc.title}</h1>
            <p className="text-xs text-slate-400">
              Last Updated: {doc.updatedAt} • Governed by Smart E-Commerce Legal Department
            </p>
          </div>

          {/* Quick Table of Contents */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Document Outline:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {doc.sections.map((sec, i) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="text-indigo-600 hover:underline truncate"
                >
                  {i + 1}. {sec.title}
                </a>
              ))}
            </div>
          </div>

          {/* Document Sections */}
          <div className="space-y-8">
            {doc.sections.map((sec, i) => (
              <div key={sec.id} id={sec.id} className="space-y-2 scroll-mt-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-indigo-600">{i + 1}.</span> {sec.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>

          {/* Customer Service Notice Footer */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>Have questions regarding these policy terms?</span>
            <button
              onClick={() => setStoreView("contact-us")}
              className="text-indigo-600 font-bold hover:underline"
            >
              Contact Legal & Customer Care &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

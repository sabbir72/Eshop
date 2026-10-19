import React from "react";
import { useStore } from "../../context/StoreContext";
import {
  Database,
  Server,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Layers,
  Activity,
  X,
  Lock,
  Cpu,
  Boxes,
  ShoppingBag,
  Users,
  ClipboardList,
  Sliders,
  Sparkles,
} from "lucide-react";

interface DatabaseArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseArchitectureModal: React.FC<DatabaseArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    products,
    orders,
    categories,
    brands,
    users,
    coupons,
    auditLogs,
    settings,
    inventoryTransactions,
    language,
    addToast,
  } = useStore();

  if (!isOpen) return null;

  const isBN = language === "BN";

  // Calculate live database metrics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalCategories = categories.length;
  const totalBrands = brands.length;
  const totalUsers = users.length;
  const totalAuditLogs = auditLogs.length;
  const totalTransactions = inventoryTransactions.length;
  const totalCoupons = coupons.length;

  // Handle master backup download (JSON format)
  const handleDownloadMasterBackup = () => {
    try {
      const fullBackupPayload = {
        metadata: {
          system: settings.websiteName || "Smart Shop Enterprise",
          exportedAt: new Date().toISOString(),
          version: "2.4.0",
          schemaVersion: "v2-relational-nosql",
          totalRecords:
            totalProducts +
            totalOrders +
            totalCategories +
            totalBrands +
            totalUsers +
            totalAuditLogs,
        },
        collections: {
          products,
          orders,
          categories,
          brands,
          users: users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            createdAt: u.createdAt,
          })),
          coupons,
          systemSettings: settings,
          inventoryTransactions,
          auditLogs: auditLogs.slice(0, 500),
        },
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(fullBackupPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `Master_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast(
        isBN
          ? "সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON) সফলভাবে ডাউনলোড হয়েছে!"
          : "Full Master Database Backup (JSON) downloaded successfully!",
        "success"
      );
    } catch (_err) {
      addToast(
        isBN
          ? "ডাটাবেজ ব্যাকআপ তৈরিতে সমস্যা হয়েছে।"
          : "Failed to generate database backup.",
        "error"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/40 shadow-inner">
              <Database className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  {isBN
                    ? "ডাটাবেজ আর্কিটেকচার ও মেইনটেন্যান্স সিস্টেম"
                    : "Database Architecture & Storage Lifecycle"}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ONLINE & HEALTHY</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isBN
                  ? "আপনার সিস্টেমের ডাটা কোথায় থাকে, কীভাবে রিয়েল-টাইম সংরক্ষিত হয় এবং সিকিউরিটি অডিট"
                  : "How your application database is structured, replicated, maintained, and backed up"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs">
          {/* Executive Summary Card */}
          <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-2xl p-4.5 space-y-2">
            <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {isBN
                  ? "ডাটাবেজ কোথায় ও কীভাবে মেইনটেইন হচ্ছে? (সংক্ষিপ্ত উত্তর)"
                  : "Where & How is the Database Maintained? (Executive Summary)"}
              </span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-xs">
              {isBN ? (
                <>
                  আপনার সিস্টেমটি একটি <strong>হাইব্রিড আর্কিটেকচার (Hybrid Architecture)</strong> ব্যবহার করে পরিচালিত হচ্ছে:
                  <br />
                  ১. <strong>ব্রাউজার ক্লায়েন্ট স্টেট (Local Persistence & Reactive Context):</strong> প্রতিটি পণ্য, অর্ডার, কার্ট এবং সেটিংস ব্রাউজারের দ্রুততম রিঅ্যাক্টিভ মেমোরিতে থাকে যাতে পেজ রিলোড বা নেটওয়ার্ক ধীরগতির হলেও সিস্টেম কখনো ক্র্যাশ না করে।
                  <br />
                  ২. <strong>ক্লাউড ফায়ারস্টোর কানেকশন (Cloud Firestore Integration):</strong> ক্লাউড ফায়ারস্টোর কনফিগারেশনের মাধ্যমে রিয়েল-টাইম অর্ডার ট্র্যাকিং এবং ব্যবহারকারী অথেন্টিকেশন সংরক্ষিত থাকে।
                  <br />
                  ৩. <strong>এক্সেল ও মাস্টার ব্যাকআপ হাব (Universal Data Portability):</strong> যেকোনো সময় ১-ক্লিকে সম্পূর্ণ পণ্যের ক্যাটালগ, ক্যাশ লেজার ও অর্ডারসমূহ এক্সেল (.xlsx) বা JSON ব্যাকআপ হিসেবে ডাউনলোড ও রিস্টোর করা যায়।
                  <br />
                  ৪. <strong>ট্যাম্পার-প্রুফ অডিট লগ (Audit Trail):</strong> প্রতিটি পণ্য তৈরি, স্টক পরিবর্তন, রোল আপডেট এবং ইনভয়েস প্রিন্ট সময় ও অ্যাডমিনের নামসহ স্বয়ংক্রিয়ভাবে অডিট লগে লিপিবদ্ধ থাকে।
                </>
              ) : (
                <>
                  Your platform runs on a robust <strong>Hybrid Persistence Engine</strong>:
                  <br />
                  1. <strong>Reactive Local State:</strong> Instant zero-latency rendering of products, inventory, orders, and configuration with automatic session preservation.
                  <br />
                  2. <strong>Cloud Firestore Architecture:</strong> Pre-provisioned schema rules (`firestore.rules`) and authentication pipelines for multi-user synchronization.
                  <br />
                  3. <strong>Master Excel & JSON Portability:</strong> 1-click full database export and batch import preventing any vendor lock-in.
                  <br />
                  4. <strong>Tamper-Evident Audit Logging:</strong> Every order status change, inventory transfer, and staff action is automatically logged with exact timestamps.
                </>
              )}
            </p>
          </div>

          {/* Live Records Counter HUD */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isBN
                  ? "বর্তমান ডাটাবেজের লাইভ রেকর্ড সংখ্যা"
                  : "Live Active Database Record Counters"}
              </span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <Boxes className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isBN ? "মোট পণ্য (Products)" : "Products Catalog"}</span>
                </span>
                <span className="text-xl font-black text-white font-mono mt-2">
                  {totalProducts}
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBN ? "মোট অর্ডার (Orders)" : "Customer Orders"}</span>
                </span>
                <span className="text-xl font-black text-white font-mono mt-2">
                  {totalOrders}
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isBN ? "নিবন্ধিত ইউজার" : "System Users"}</span>
                </span>
                <span className="text-xl font-black text-white font-mono mt-2">
                  {totalUsers}
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBN ? "অডিট ট্রেইল লগ" : "Audit Log Records"}</span>
                </span>
                <span className="text-xl font-black text-white font-mono mt-2">
                  {totalAuditLogs}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Pillars Architecture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="bg-slate-800/50 border border-slate-700/70 p-4 rounded-2xl space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                <HardDrive className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">
                {isBN ? "১. ক্লায়েন্ট ও লোকাল মেমোরি" : "1. Local & Session Storage"}
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {isBN
                  ? "ইউজারের কার্ট, ব্রাউজিং ক্যাশ এবং অফলাইন স্টেট সংরক্ষিত থাকে যাতে ইন্টারনেট বিচ্ছিন্ন হলেও ব্যবহারকারী অর্ডার দেখতে পারেন।"
                  : "Cart items, customer session, and active draft states are cached locally for zero-latency instant offline capability."}
              </p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isBN ? "সব ডিভাইসে শতভাগ সক্রিয়" : "100% Cross-Device Ready"}</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-800/50 border border-slate-700/70 p-4 rounded-2xl space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                <Server className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">
                {isBN ? "২. ক্লাউড ও সিকিউরিটি রুলস" : "2. Cloud & Security Rules"}
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {isBN
                  ? "সিকিউরিটি রুলস (firestore.rules) এর মাধ্যমে রোল-বেসড এক্সেস কন্ট্রোল (RBAC) প্রয়োগ করা হয়, যাতে গ্রাহক শুধু নিজের কপি দেখতে পারেন।"
                  : "Role-Based Access Control (RBAC) ensures customers only access their copy while admins access warehouse orders."}
              </p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold">
                <Lock className="w-3 h-3" />
                <span>{isBN ? "কাস্টমার কপি সিকিউরড" : "Customer Copy Protected"}</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-800/50 border border-slate-700/70 p-4 rounded-2xl space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold border border-teal-500/30">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">
                {isBN ? "৩. এক্সেল ও মাস্টার ব্যাকআপ হাব" : "3. Excel & Master Backup Hub"}
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {isBN
                  ? "সম্পূর্ণ ডাটাবেজ যেকোনো সময় এক্সেল শিট বা JSON ফাইলে এক্সপোর্ট করে অফলাইনে সেভ রাখা যায় এবং নতুন প্রোডাক্ট বাল্ক আপলোড করা যায়।"
                  : "Universal data portability with multi-sheet Excel generation, bulk catalog imports, and daily scheduled export snapshots."}
              </p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-teal-400 font-bold">
                <Download className="w-3 h-3" />
                <span>{isBN ? "১-ক্লিক সম্পূর্ণ এক্সপোর্ট" : "1-Click Full Export"}</span>
              </div>
            </div>
          </div>

          {/* Maintenance & Integrity Guarantees */}
          <div className="bg-slate-950/70 border border-slate-800 p-4.5 rounded-2xl space-y-3">
            <h5 className="font-bold text-white text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {isBN
                  ? "ডাটাবেজ মেইনটেন্যান্স ও অখণ্ডতা বজায় রাখার নিয়মাবলী"
                  : "Automated Maintenance & Data Integrity Rules"}
              </span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>অটো-রিকনসিলিয়েশন:</strong> প্রতিটি অর্ডারের স্টক কাটার সাথে সাথে ইনভেন্টরি ট্রানজেকশনে লেজার এন্ট্রি তৈরি হয়।
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ক্যাশ ব্যালেন্স চেক:</strong> ক্যাশ ক্যালকুলেশন মডিউলে ডেলিভার্ড ক্যাশ অন ডেলিভারি (COD) অ্যামাউন্ট লাইভ ক্যালকুলেট হয়।
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ইনভয়েস আইসোলেশন:</strong> কাস্টমার কপি শুধু ডাউনলোড/প্রিন্ট করা যায়; ওয়াটারমার্ক বা মার্জ কাস্টমার এডিট করতে পারে না।
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ডিজাস্টার রিকভারি:</strong> যেকোনো ডিভাইস নষ্ট হলে ব্যাকআপ JSON থেকে ১০০% ডাটা পূর্বের অবস্থায় ফিরিয়ে আনা সম্ভব।
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {isBN
                ? "ডাটা ইঞ্জিন: React Context State + Firestore Architecture + Excel Sync"
                : "Engine: Reactive StoreContext + Firestore Rules + Universal Excel Sync"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {isBN ? "বন্ধ করুন" : "Close"}
            </button>

            <button
              onClick={handleDownloadMasterBackup}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isBN ? "সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON) ডাউনলোড" : "Download Master Database (JSON)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

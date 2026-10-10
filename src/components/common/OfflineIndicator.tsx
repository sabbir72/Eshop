import React from "react";
import { useOnlineStatus } from "../../hooks/usePWAInstall";
import { WifiOff, AlertTriangle } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50 flex items-center gap-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-500/50 p-3.5 text-xs text-white shadow-2xl animate-bounce">
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>অফলাইন মোড সক্রিয় (Offline Mode)</span>
        </div>
        <p className="text-[11px] text-slate-300 mt-0.5">
          ইন্টারনেট সংযোগ বন্ধ থাকলেও অ্যাপের ক্যাশড ডাটা নিরাপদে ব্যবহার করতে পারছেন।
        </p>
      </div>
    </div>
  );
};

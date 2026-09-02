import React from "react";
import { useStore } from "../../context/StoreContext";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

export const NotificationToast: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bg = "bg-slate-900 text-white border-slate-700";
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === "success") {
          bg = "bg-emerald-950/90 text-emerald-100 border-emerald-700/60";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === "error") {
          bg = "bg-rose-950/90 text-rose-100 border-rose-700/60";
          icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === "warning") {
          bg = "bg-amber-950/90 text-amber-100 border-amber-700/60";
          icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-auto ${bg}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-80 transition-opacity ml-2 rounded-md"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

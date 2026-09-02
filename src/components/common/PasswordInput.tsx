import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  icon = <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />,
  containerClassName = "",
  inputClassName = "",
  id,
  placeholder = "••••••••",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleVisibility();
    }
  };

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="font-bold text-slate-700 block text-xs mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon}
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 ${
            icon ? "pl-9" : "pl-3"
          } pr-10 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${inputClassName}`}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          onKeyDown={handleKeyDown}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 text-slate-400 hover:text-slate-600 focus:text-indigo-600 focus:outline-none p-1 rounded-md transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

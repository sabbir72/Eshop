import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { PasswordInput } from "../common/PasswordInput";
import { User, KeyRound, Shield, MapPin, Mail, Phone, ShoppingBag, CheckCircle } from "lucide-react";

export const UserProfileView: React.FC = () => {
  const { currentUser, setCurrentUser, addToast, recordAuditLog, activeRole, setStoreView } = useStore();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState(currentUser.address);
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  if (activeRole === "Guest" || currentUser.role === "Guest") {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-600 font-medium">
          Please sign in to view and manage your account profile and security credentials.
        </p>
        <button
          onClick={() => setStoreView("home")}
          className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      name,
      email,
      phone,
      address,
      twoFactorEnabled: twoFactor,
    });
    recordAuditLog("Updated User Profile Details", "Auth");
    addToast("Profile details saved successfully!", "success");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast("Please enter your current password.", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("New password must be at least 8 characters long.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast("New passwords do not match!", "error");
      return;
    }
    recordAuditLog("Changed Password", "Auth");
    addToast("Password changed successfully!", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" />
          <div>
            <h1 className="text-2xl font-black tracking-tight">{currentUser.name}</h1>
            <p className="text-xs text-slate-300">Role: <strong className="text-amber-400">{activeRole}</strong> • Member since {currentUser.createdAt}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Account & Security Information
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Default Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" /> Enable Two Factor Authentication (2FA) Security
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" /> Security: Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">Purchase Metrics</h4>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total Orders Placed:</span>
              <strong className="text-slate-900">{currentUser.ordersCount}</strong>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100">
              <span className="text-slate-500">Account Status:</span>
              <span className="text-emerald-600 font-bold uppercase">{currentUser.status}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100">
              <span className="text-slate-500">2FA Security:</span>
              <span className={twoFactor ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                {twoFactor ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

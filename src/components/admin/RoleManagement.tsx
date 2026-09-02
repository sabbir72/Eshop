import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { UserRole, PermissionAction, ModuleName } from "../../types";
import { Shield, Check, X, Users, UserCheck } from "lucide-react";

export const RoleManagement: React.FC = () => {
  const { permissions, updateRolePermission, activeRole, switchRole } = useStore();

  const allRoles: UserRole[] = [
    "Super Admin",
    "Admin",
    "Category Manager",
    "Product Manager",
    "Order Manager",
    "Inventory Manager",
    "Customer Support",
    "Customer",
    "Guest",
  ];

  const [selectedRole, setSelectedRole] = useState<UserRole>("Product Manager");

  const modulesList: ModuleName[] = [
    "Product",
    "Category",
    "Brand",
    "Inventory",
    "Order",
    "Coupon",
    "User",
    "Reports",
    "Settings",
    "Audit",
  ];

  const actionsList: PermissionAction[] = ["view", "add", "edit", "delete", "export", "import"];

  const togglePermission = (mod: ModuleName, act: PermissionAction, currentValue: boolean) => {
    updateRolePermission(selectedRole, mod, act, !currentValue);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Role-Based Access Control (RBAC)</h1>
          <p className="text-xs text-slate-300">Granular permission matrix for custom administrative user roles</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Currently Editing Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 font-bold text-xs"
          >
            {allRoles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" /> Permission Matrix: {selectedRole}
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click checkboxes to toggle action access</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Module Name</th>
                {actionsList.map((act) => (
                  <th key={act} className="p-3 text-center uppercase">{act}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {modulesList.map((mod) => {
                const isSuperAdmin = selectedRole === "Super Admin";

                return (
                  <tr key={mod} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{mod} Management</td>
                    {actionsList.map((act) => {
                      const isChecked = isSuperAdmin || (permissions?.[mod]?.[act] ?? false);

                      return (
                        <td key={act} className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(mod, act, isChecked)}
                            disabled={isSuperAdmin}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

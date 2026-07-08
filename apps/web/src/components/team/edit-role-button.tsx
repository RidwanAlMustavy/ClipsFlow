"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { updateAgencyMemberRole, removeAgencyMember } from "@/app/actions/team";
import { Role } from "@clipsflow/db";

interface Props {
  userId: string;
  initialRole: Role;
  name: string;
}

export function EditRoleButton({ userId, initialRole, name }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleUpdateRole(formData: FormData) {
    const role = formData.get("role") as Role;
    if (role === initialRole) {
      setIsOpen(false);
      return;
    }

    setIsPending(true);
    try {
      const result = await updateAgencyMemberRole(userId, role);
      if (result?.error) {
        alert(result.error);
        return;
      }
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemove() {
    if (!confirm(`Are you sure you want to remove ${name} from the agency?`)) return;

    setIsRemoving(true);
    try {
      const result = await removeAgencyMember(userId);
      if (result?.error) {
        alert(result.error);
        return;
      }
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
      >
        Edit Role
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Team Member</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <Icons.tool className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <form action={handleUpdateRole} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Role for {name}
                </label>
                <select
                  name="role"
                  defaultValue={initialRole}
                  required
                  className="block w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="AGENCY_ADMIN">Admin (Full Access)</option>
                  <option value="EDITOR">Editor (Manage Content Only)</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isRemoving || isPending}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm disabled:opacity-50"
                >
                  {isRemoving ? "Removing..." : "Remove Member"}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || isRemoving}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { removeClientUser } from "@/app/actions/clients";

export function RemoveUserButton({ userId }: { userId: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleRemove() {
    if (!confirm("Are you sure you want to remove this user? They will lose access to the workspace.")) {
      return;
    }
    
    setIsPending(true);
    try {
      await removeClientUser(userId);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to remove user");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button 
      onClick={handleRemove}
      disabled={isPending}
      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Removing..." : "Remove"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { updateAssetStatus } from "@/app/actions/content";

interface Props {
  assetId: string;
  initialStatus: "PROCESSING" | "READY" | "FAILED";
}

export function StatusBadgeToggle({ assetId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);

  async function handleToggle() {
    // Cycle through statuses for demo purposes
    const nextStatus = status === "PROCESSING" ? "READY" : status === "READY" ? "FAILED" : "PROCESSING";
    
    setIsPending(true);
    try {
      const result = await updateAssetStatus(assetId, nextStatus);
      if (result?.error) {
        alert(result.error);
        return;
      }
      setStatus(nextStatus);
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    } finally {
      setIsPending(false);
    }
  }

  const badgeClass = status === 'READY' 
    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
    : status === 'PROCESSING' 
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' 
      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      title="Click to toggle status"
      className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${badgeClass}`}
    >
      {isPending ? "..." : status}
    </button>
  );
}

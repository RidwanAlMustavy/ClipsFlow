"use client";

import { useState } from "react";
import { updateClipStatus } from "@/app/actions/approvals";
import { ClipStatus } from "@prisma/client";

interface Props {
  clipId: string;
  initialStatus: ClipStatus;
}

const STATUS_CONFIG: Record<ClipStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400" },
  PROCESSING: { label: "Processing", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" },
  PENDING_REVIEW: { label: "Pending Review", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  PUBLISHED: { label: "Published", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 font-bold" }
};

export function ClipStatusUpdater({ clipId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as ClipStatus;
    
    setIsPending(true);
    try {
      const result = await updateClipStatus(clipId, newStatus);
      if (result?.error) {
        alert(result.error);
        return;
      }
      setStatus(newStatus);
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    } finally {
      setIsPending(false);
    }
  }

  const currentConfig = STATUS_CONFIG[status];

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isPending}
        className={`appearance-none text-xs font-medium px-3 py-1.5 pr-8 rounded-full cursor-pointer border-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 ${currentConfig.className}`}
      >
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <option key={key} value={key} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
            {config.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { approveClip, deleteClip } from "@/app/actions/clips";

interface ClipActionsProps {
  clipId: string;
  status: string;
  agencySubdomain: string;
}

export function ClipActions({ clipId, status, agencySubdomain }: ClipActionsProps) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveClip(clipId, `/app/${agencySubdomain}/client`);
    } catch (error) {
      console.error(error);
      alert("Failed to approve clip");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this clip?")) return;
    try {
      setIsDeleting(true);
      await deleteClip(clipId, agencySubdomain);
    } catch (error) {
      console.error(error);
      alert("Failed to delete clip");
      setIsDeleting(false);
    }
  };

  if (status === 'PENDING_REVIEW') {
    return (
      <div className="flex gap-2 mt-auto">
        <button 
          onClick={handleApprove}
          disabled={loading || isDeleting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Approve"
          )}
        </button>
        <Link 
          href={`/client/content/${clipId}`}
          className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2 rounded-lg text-sm font-semibold transition-colors border border-zinc-200 dark:border-zinc-700 flex items-center justify-center"
        >
          Comment
        </Link>
        <button onClick={handleDelete} disabled={isDeleting} className="px-3 flex items-center justify-center border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-auto">
      <Link 
        href={`/client/content/${clipId}`}
        className="flex-1 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        View Details
      </Link>
      <button onClick={handleDelete} disabled={isDeleting} className="px-3 flex items-center justify-center border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

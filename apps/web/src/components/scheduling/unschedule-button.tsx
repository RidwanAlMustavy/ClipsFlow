"use client";

import { useState } from "react";
import { unscheduleClip } from "@/app/actions/scheduling";
import { Loader2, CalendarOff } from "lucide-react";

interface Props {
  clipId: string;
}

export function UnscheduleButton({ clipId }: Props) {
  const [isUnscheduling, setIsUnscheduling] = useState(false);

  async function handleUnschedule() {
    if (!confirm("Are you sure you want to remove this clip from the schedule? It will be moved back to Approved status.")) return;
    
    setIsUnscheduling(true);
    const result = await unscheduleClip(clipId);
    
    if (result.error) {
      alert(result.error);
      setIsUnscheduling(false);
    }
  }

  return (
    <button
      onClick={handleUnschedule}
      disabled={isUnscheduling}
      title="Unschedule Clip"
      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
    >
      {isUnscheduling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CalendarOff className="w-4 h-4" />
      )}
      Unschedule
    </button>
  );
}

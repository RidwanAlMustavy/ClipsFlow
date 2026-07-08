"use client";

import { useState } from "react";
import { deleteClip } from "@/app/actions/approvals";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  clipId: string;
}

export function DeleteClipButton({ clipId }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this clip?")) return;
    
    setIsDeleting(true);
    const result = await deleteClip(clipId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    }
    // On success, revalidatePath in action will refresh the list
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Clip"
      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}

"use client";

import { useState } from "react";
import { deleteBrandKit } from "@/app/actions/brands";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  brandKitId: string;
}

export function DeleteBrandButton({ brandKitId }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this brand kit?")) return;
    
    setIsDeleting(true);
    const result = await deleteBrandKit(brandKitId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Brand Kit"
      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors disabled:opacity-50"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}

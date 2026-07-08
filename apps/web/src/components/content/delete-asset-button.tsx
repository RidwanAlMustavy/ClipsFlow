"use client";

import { useState } from "react";
import { deleteAgencyAsset } from "@/app/actions/content";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  assetId: string;
}

export function DeleteAssetButton({ assetId }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this asset? All generated clips will also be permanently deleted.")) return;
    
    setIsDeleting(true);
    const result = await deleteAgencyAsset(assetId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Asset"
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

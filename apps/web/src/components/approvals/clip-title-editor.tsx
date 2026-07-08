"use client";

import { useState } from "react";
import { updateClipTitle } from "@/app/actions/clips";
import { Icons } from "@/components/ui/icons";

interface Props {
  clipId: string;
  initialTitle: string;
  pathToRevalidate: string;
  variant?: "heading" | "list";
}

export function ClipTitleEditor({ clipId, initialTitle, pathToRevalidate, variant = "heading" }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isPending, setIsPending] = useState(false);

  async function handleSave() {
    if (!title.trim() || title === initialTitle) {
      setIsEditing(false);
      setTitle(initialTitle);
      return;
    }

    setIsPending(true);
    try {
      await updateClipTitle(clipId, title, pathToRevalidate);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update title");
    } finally {
      setIsPending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(initialTitle);
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full max-w-md">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          disabled={isPending}
          className={`flex-1 font-bold bg-white dark:bg-zinc-950 border border-indigo-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            variant === "heading" ? "text-2xl" : "text-base"
          }`}
        />
        {isPending && <Icons.loader className="w-5 h-5 text-indigo-500 animate-spin" />}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      {variant === "heading" ? (
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {title}
        </h1>
      ) : (
        <p className="line-clamp-1 max-w-[250px] font-semibold text-zinc-900 dark:text-white">
          {title}
        </p>
      )}
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md"
        title="Edit title"
      >
        <Icons.edit className="w-4 h-4" />
      </button>
    </div>
  );
}

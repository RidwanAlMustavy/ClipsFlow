"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { generateClips } from "@/app/actions/content";

interface Props {
  assetId: string;
}

const AVAILABLE_FORMATS = [
  { id: "TIKTOK", label: "TikTok / Shorts" },
  { id: "REELS", label: "Instagram Reels" },
  { id: "LINKEDIN", label: "LinkedIn Video" },
];

export function GenerateClipsModal({ assetId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["TIKTOK"]);

  function toggleFormat(formatId: string) {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(f => f !== formatId)
        : [...prev, formatId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedFormats.length === 0) {
      alert("Please select at least one format");
      return;
    }

    setIsPending(true);
    try {
      const result = await generateClips(assetId, selectedFormats);
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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
      >
        Generate Clips
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Generate Clips</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <Icons.tool className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Select Formats to Generate
                </label>
                <div className="space-y-3">
                  {AVAILABLE_FORMATS.map(format => (
                    <label 
                      key={format.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedFormats.includes(format.id) 
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                          : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedFormats.includes(format.id)}
                        onChange={() => toggleFormat(format.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{format.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || selectedFormats.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {isPending ? "Generating..." : "Start Generation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

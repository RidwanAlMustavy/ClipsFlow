"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { uploadAgencyAsset } from "@/app/actions/content";
import { UploadDropzone } from "@/utils/uploadthing";

interface Client {
  id: string;
  name: string;
}

interface Props {
  clients: Client[];
}

export function UploadAssetModal({ clients }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [uploadType, setUploadType] = useState<"youtube" | "file">("file");
  const [clientId, setClientId] = useState("");

  async function handleYoutubeSubmit(formData: FormData) {
    if (!clientId) {
      alert("Please select a client.");
      return;
    }
    formData.append("clientId", clientId);
    setIsPending(true);
    try {
      const result = await uploadAgencyAsset(formData);
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

  async function handleFileComplete(res: any) {
    if (!res || !res.length) {
      alert("Upload completed but no file URL was returned.");
      return;
    }
    if (!clientId) return;
    setIsPending(true);
    try {
      const fileUrl = res[0].url;
      const fileName = res[0].name;
      const formData = new FormData();
      formData.append("fileUrl", fileUrl);
      formData.append("clientId", clientId);
      if (fileName) formData.append("title", fileName);
      
      const result = await uploadAgencyAsset(formData);
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
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
      >
        <Icons.upload className="w-4 h-4" />
        Upload Asset
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Upload New Asset</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <Icons.tool className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Target Client
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="block w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mb-6 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUploadType("file")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    uploadType === "file" 
                      ? "bg-white dark:bg-zinc-900 shadow text-indigo-600 dark:text-indigo-400" 
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  Video File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("youtube")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    uploadType === "youtube" 
                      ? "bg-white dark:bg-zinc-900 shadow text-indigo-600 dark:text-indigo-400" 
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  YouTube Link
                </button>
              </div>

              {uploadType === "youtube" ? (
                <form action={handleYoutubeSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      name="youtubeUrl"
                      required
                      placeholder="https://youtube.com/watch?v=..."
                      className="block w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
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
                      disabled={isPending || !clientId}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                      {isPending ? "Uploading..." : "Import"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {!clientId ? (
                    <div className="p-8 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      Please select a Target Client above before uploading.
                    </div>
                  ) : isPending ? (
                    <div className="p-8 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Saving asset...
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="videoUploader"
                      onClientUploadComplete={(res) => {
                        handleFileComplete(res);
                      }}
                      onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                      onBeforeUploadBegin={(files) => {
                        // Max 150MB
                        const MAX_SIZE = 150 * 1024 * 1024;
                        const validFiles = files.filter(f => f.size <= MAX_SIZE);
                        if (validFiles.length < files.length) {
                          alert("One or more files exceed the 150MB limit and were removed.");
                        }
                        return validFiles;
                      }}
                      className="ut-label:text-lg ut-allowed-content:ut-uploading:text-red-300"
                    />
                  )}
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-5 py-2.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

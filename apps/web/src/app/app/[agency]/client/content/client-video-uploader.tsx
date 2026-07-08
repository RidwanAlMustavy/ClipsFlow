"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { UploadDropzone } from "@/utils/uploadthing";
import { uploadAgencyAsset } from "@/app/actions/content";
import { useRouter } from "next/navigation";

interface ClientVideoUploaderProps {
  clientId: string;
  agencyId: string;
}

export function ClientVideoUploader({ clientId, agencyId }: ClientVideoUploaderProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleYoutubeSubmit(formData: FormData) {
    formData.append("clientId", clientId);
    setIsPending(true);
    try {
      const result = await uploadAgencyAsset(formData);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.refresh();
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
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-10 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Submit New Video</h2>
      
      <form action={handleYoutubeSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            YouTube Video URL
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Icons.link className="h-5 w-5" />
              </div>
              <input
                type="url"
                name="youtubeUrl"
                placeholder="https://youtube.com/watch?v=..."
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Icons.upload className="w-4 h-4" />
              {isPending ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
        
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white dark:bg-zinc-900 text-sm text-zinc-500">or</span>
        </div>
      </div>

      <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
        {isPending ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-zinc-500">Saving asset...</span>
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
              const MAX_SIZE = 150 * 1024 * 1024;
              const validFiles = files.filter(f => f.size <= MAX_SIZE);
              if (validFiles.length < files.length) {
                alert("One or more files exceed the 150MB limit and were removed.");
              }
              return validFiles;
            }}
            className="ut-label:text-lg ut-allowed-content:ut-uploading:text-red-300 border-none bg-transparent w-full"
          />
        )}
      </div>
    </div>
  );
}

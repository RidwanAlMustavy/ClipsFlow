"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { createBrandKit, updateBrandKit } from "@/app/actions/brands";
import { Icons } from "@/components/ui/icons";

interface Client {
  id: string;
  name: string;
}

interface BrandKit {
  id: string;
  clientId: string;
  logoUrl: string | null;
  colors: string | null;
  fonts: string | null;
}

interface Props {
  clients: Client[];
  existingKit?: BrandKit;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export function BrandKitModal({ clients, existingKit, onClose, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  function handleClose() {
    setIsOpen(false);
    if (onClose) onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    let result;
    if (existingKit) {
      result = await updateBrandKit(existingKit.id, formData);
    } else {
      result = await createBrandKit(formData);
    }
    
    setIsLoading(false);
    
    if (result.error) {
      alert(result.error);
    } else {
      handleClose();
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger || (
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <Icons.layout className="w-4 h-4" />
            Create Brand Kit
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {existingKit ? "Edit Brand Kit" : "Create Brand Kit"}
              </h2>
              <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!existingKit && (
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Client
                  </label>
                  <select 
                    id="clientId" 
                    name="clientId" 
                    required 
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Logo URL
                </label>
                <input 
                  type="url" 
                  id="logoUrl" 
                  name="logoUrl" 
                  defaultValue={existingKit?.logoUrl || ""}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="colors" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Brand Colors (Comma separated hex codes)
                </label>
                <input 
                  type="text" 
                  id="colors" 
                  name="colors" 
                  defaultValue={existingKit?.colors || ""}
                  placeholder="#FFFFFF, #000000, #4F46E5"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="fonts" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Brand Fonts (Comma separated)
                </label>
                <input 
                  type="text" 
                  id="fonts" 
                  name="fonts" 
                  defaultValue={existingKit?.fonts || ""}
                  placeholder="Inter, Roboto, sans-serif"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    "Save Brand Kit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

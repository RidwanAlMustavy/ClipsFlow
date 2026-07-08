"use client";

import { useState } from "react";
import { scheduleClip } from "@/app/actions/scheduling";
import { Loader2, Calendar, X } from "lucide-react";

interface Props {
  clipId: string;
  existingDate?: Date | null;
  trigger?: React.ReactNode;
}

export function ScheduleClipModal({ clipId, existingDate, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  function handleClose() {
    setIsOpen(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    
    // Combine date and time
    const dateTime = new Date(`${date}T${time}`);
    
    const result = await scheduleClip(clipId, dateTime.toISOString());
    
    setIsLoading(false);
    
    if (result.error) {
      alert(result.error);
    } else {
      handleClose();
    }
  }

  // Format existing date for inputs
  const defaultDate = existingDate ? new Date(existingDate).toISOString().split('T')[0] : '';
  const defaultTime = existingDate ? new Date(existingDate).toTimeString().slice(0, 5) : '';

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer inline-block">
        {trigger || (
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            {existingDate ? "Reschedule" : "Schedule"}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Schedule Clip
              </h2>
              <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Post Date
                </label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  required 
                  defaultValue={defaultDate}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Post Time (Local)
                </label>
                <input 
                  type="time" 
                  id="time" 
                  name="time" 
                  required 
                  defaultValue={defaultTime}
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
                    <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling...</>
                  ) : (
                    "Schedule"
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

"use client";

import Link from "next/link";

interface FooterProps {
  type: "superadmin" | "agency" | "client";
  agencyName?: string;
}

export function Footer({ type, agencyName }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {type === "superadmin" ? (
          <>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              v1.0.0-beta • {process.env.NODE_ENV === "development" ? "development" : "production"}
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="#" className="hover:text-indigo-600 transition-colors">Internal Docs</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Status Page</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Support Escalation</Link>
            </div>
          </>
        ) : type === "agency" ? (
          <>
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} {agencyName || "Agency"}. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="#" className="hover:text-indigo-600 transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Contact Support</Link>
              <div className="flex items-center gap-1.5 border-l border-zinc-300 dark:border-zinc-700 pl-4">
                <span className="text-xs text-zinc-400">Powered by</span>
                <span className="font-bold text-xs tracking-tight text-zinc-800 dark:text-zinc-200">ClipsFlow</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} {agencyName || "Agency"}. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="#" className="hover:text-indigo-600 transition-colors">Help & Support</Link>
            </div>
          </>
        )}
        
      </div>
    </footer>
  );
}

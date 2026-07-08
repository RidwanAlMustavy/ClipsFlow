"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/ui/icons";

export type NavItem = {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  disabled?: boolean;
};

interface SidebarProps {
  items: NavItem[];
  title?: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-64 flex-shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-4 min-h-[calc(100vh-64px)]">
      {title && (
        <div className="mb-4 px-2">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {title}
          </h2>
        </div>
      )}
      <ul className="space-y-1">
        {items.map((item, index) => {
          const Icon = Icons[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <li key={index}>
              <Link
                href={item.disabled ? "#" : item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50"}
                  ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <Icon className="w-4 h-4" />
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

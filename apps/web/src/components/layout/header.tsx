"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icons } from "@/components/ui/icons";
import { signOut } from "next-auth/react";

interface HeaderProps {
  logo?: React.ReactNode;
  brandName?: string;
  badge?: string;
  showSearch?: boolean;
  showHealth?: boolean;
  rightActions?: React.ReactNode;
  userEmail?: string;
}

export function Header({
  logo,
  brandName,
  badge,
  showSearch,
  showHealth,
  rightActions,
  userEmail
}: HeaderProps) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New clip approved', message: 'Client "TechNova" approved the Q3 Launch clip.', time: '2 hours ago', type: 'success', read: false },
    { id: 2, title: 'Generation complete', message: 'Batch #482 has finished generating 12 clips.', time: '5 hours ago', type: 'info', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          {logo || (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Icons.logo className="w-5 h-5 text-white" />
            </div>
          )}
          {brandName && (
            <span className="font-bold tracking-tight text-zinc-900 dark:text-white">
              {brandName}
            </span>
          )}
        </Link>
        {badge && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            {badge}
          </span>
        )}
      </div>

      {showSearch && (
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Icons.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search across all data..." 
            className="w-full pl-9 pr-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        {rightActions}
        
        {showHealth && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-500/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">All Systems Operational</span>
          </div>
        )}

        <div className="group relative">
          <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors relative p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Icons.bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-zinc-950"></span>
            )}
          </button>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Notifications {unreadCount > 0 && <span className="ml-1 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 py-0.5 px-2 rounded-full text-xs">{unreadCount} new</span>}
              </p>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-sm">No notifications</div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-3 border-b border-zinc-100 dark:border-zinc-800/50 transition-colors flex gap-3 items-start ${notif.read ? 'opacity-60' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 bg-indigo-50/30 dark:bg-indigo-900/10'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                      {notif.type === 'success' ? <Icons.checkCircle className="w-4 h-4" /> : <Icons.video className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-zinc-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <button onClick={() => alert("This would navigate to a dedicated /notifications page showing all historical notifications.")} className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
                View all notifications
              </button>
            </div>
          </div>
        </div>
        
        <ThemeToggle />

        <div className="group relative">
          <button className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Signed in as</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{userEmail || 'User'}</p>
            </div>
            <div className="p-2">
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                <Icons.logOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar, NavItem } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";

const superAdminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/superadmin", icon: "dashboard" },
  { title: "Agencies", href: "/superadmin/agencies", icon: "briefcase" },
  { title: "Users", href: "/superadmin/users", icon: "users" },
  { title: "Subscriptions & Billing", href: "/superadmin/billing", icon: "billing" },
  { title: "Analytics", href: "/superadmin/analytics", icon: "analytics" },
  { title: "System/Jobs", href: "/superadmin/system", icon: "activity" },
  { title: "Support Tools", href: "/superadmin/support", icon: "tool" },
  { title: "Settings", href: "/superadmin/settings", icon: "settings" },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header 
        brandName="ClipsFlow"
        badge="Super Admin"
        showSearch={true}
        showHealth={true}
        userEmail={session.user?.email || undefined}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={superAdminNavItems} title="Platform Management" />
        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
          <Footer type="superadmin" />
        </main>
      </div>
    </div>
  );
}

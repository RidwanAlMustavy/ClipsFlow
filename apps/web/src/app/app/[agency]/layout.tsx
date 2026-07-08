import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Header } from "@/components/layout/header";
import { Sidebar, NavItem } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";

export default async function AgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agency: string }> | { agency: string };
}) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const role = (session.user as any).role;
  const isAgencyAdmin = role === "AGENCY_ADMIN" || role === "SUPER_ADMIN";
  const isClient = role === "CLIENT";

  if (!isAgencyAdmin && !isClient) {
    redirect("/api/auth/signin");
  }

  const agency = await prisma.agency.findUnique({
    where: { subdomain: resolvedParams.agency }
  });

  if (!agency) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-zinc-900 dark:text-zinc-50">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-500 mb-4">404</h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">Agency not found.</p>
      </div>
    );
  }

  const basePath = `/app/${agency.subdomain}`;

  const agencyNavItems: NavItem[] = [
    { title: "Dashboard", href: `${basePath}/admin`, icon: "dashboard" },
    { title: "Clients", href: `${basePath}/clients`, icon: "users" },
    { title: "Content Library", href: `${basePath}/content`, icon: "folder" },
    { title: "Approvals", href: `${basePath}/approvals`, icon: "checkCircle" },
    { title: "Team", href: `${basePath}/team`, icon: "briefcase" },
    { title: "Brand Kits", href: `${basePath}/brands`, icon: "layout" },
    { title: "Scheduling", href: `${basePath}/scheduling`, icon: "calendar" },
    { title: "Billing", href: `${basePath}/billing`, icon: "billing" },
    { title: "Settings", href: `${basePath}/settings`, icon: "settings" },
  ];

  const clientNavItems: NavItem[] = [
    { title: "Home", href: `${basePath}/client`, icon: "dashboard" },
    { title: "My Content", href: `${basePath}/client/content`, icon: "folder" },
    { title: "Calendar", href: `${basePath}/client/calendar`, icon: "calendar" },
    { title: "Comments", href: `${basePath}/client/comments`, icon: "messageSquare" },
    { title: "Settings", href: `${basePath}/settings`, icon: "settings" },
  ];

  const headerActions = null;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header 
        brandName={agency.name}
        showSearch={false}
        rightActions={headerActions}
        userEmail={session.user?.email || undefined}
        logo={
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
            {agency.name.charAt(0)}
          </div>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          items={isAgencyAdmin ? agencyNavItems : clientNavItems} 
          title={isAgencyAdmin ? "Agency Tools" : "Client Portal"} 
        />
        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
          <Footer type={isAgencyAdmin ? "agency" : "client"} agencyName={agency.name} />
        </main>
      </div>
    </div>
  );
}

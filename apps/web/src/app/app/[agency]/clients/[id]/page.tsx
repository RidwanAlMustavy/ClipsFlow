import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { EditClientButton } from "@/components/clients/edit-client-button";
import { InviteUserButton } from "@/components/clients/invite-user-button";
import { RemoveUserButton } from "@/components/clients/remove-user-button";

export default async function AgencyClientDetailsPage({ params }: { params: Promise<{ agency: string, id: string }> | { agency: string, id: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/api/auth/signin");
  }

  const client = await prisma.client.findFirst({
    where: { 
      id: resolvedParams.id,
      agency: { subdomain: resolvedParams.agency }
    },
    include: { users: true, sourceAssets: true }
  });

  if (!client) return <div>Client not found or you don't have access.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors">
        <Icons.chevronDown className="w-4 h-4 rotate-90" />
        Back to Clients
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{client.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Client Workspace Details</p>
        </div>
        <div className="flex gap-3">
          <EditClientButton 
            clientId={client.id} 
            initialName={client.name} 
            primaryUser={client.users[0]} 
          />
          <InviteUserButton clientId={client.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Client Users</h2>
          {client.users.length === 0 ? (
            <p className="text-zinc-500 text-sm">No users invited to this client yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {client.users?.map((user: any) => (
                <li key={user.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">{user.email}</p>
                    <p className="text-xs text-zinc-500">{user.role}</p>
                  </div>
                  <RemoveUserButton userId={user.id} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Recent Assets</h2>
          {client.sourceAssets.length === 0 ? (
            <p className="text-zinc-500 text-sm">No assets uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {client.sourceAssets?.slice(0, 5).map((asset: any) => (
                <li key={asset.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Icons.video className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">{asset.title || asset.youtubeUrl || "Uploaded File"}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{asset.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

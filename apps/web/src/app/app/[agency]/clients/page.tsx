import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import { AddClientButton } from "@/components/clients/add-client-button";
import { EditClientButton } from "@/components/clients/edit-client-button";
import { DeleteClientButton } from "@/components/clients/delete-client-button";
import Link from "next/link";

export default async function AgencyClientsPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/api/auth/signin");
  }

  const agency = await prisma.agency.findUnique({
    where: { subdomain: resolvedParams.agency },
    include: { 
      clients: {
        include: { users: true }
      } 
    }
  });

  if (!agency) return <div>Agency not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Clients</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your agency's clients and their workspaces.</p>
        </div>
        <AddClientButton />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              <th className="p-4 pl-6">Client Name</th>
              <th className="p-4">Users</th>
              <th className="p-4">Created At</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agency.clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  No clients added yet.
                </td>
              </tr>
            ) : (
              agency.clients.map((client) => (
                <tr key={client.id} className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-zinc-900 dark:text-white">{client.name}</td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{client.users.length} Users</td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 pr-6 text-right">
                    <Link href={`/clients/${client.id}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm mr-4">
                      View details
                    </Link>
                    <EditClientButton clientId={client.id} initialName={client.name} primaryUser={client.users[0]} />
                    <DeleteClientButton clientId={client.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

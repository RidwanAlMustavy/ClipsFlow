import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { InviteMemberButton } from "@/components/team/invite-member-button";
import { EditRoleButton } from "@/components/team/edit-role-button";

export default async function AgencyTeamPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/api/auth/signin");
  }

  const agency = await prisma.agency.findUnique({
    where: { subdomain: resolvedParams.agency },
    include: { users: true }
  });

  if (!agency) return <div>Agency not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Team Settings</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your agency's team members and their roles.</p>
        </div>
        <InviteMemberButton />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              <th className="p-4 pl-6">Name / Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agency.users?.filter((u: any) => u.role !== 'CLIENT').map((user: any) => (
              <tr key={user.id} className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="p-4 pl-6">
                  <p className="font-medium text-zinc-900 dark:text-white">{user.firstName} {user.lastName || ''}</p>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    user.role === 'AGENCY_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' :
                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <EditRoleButton 
                    userId={user.id} 
                    initialRole={user.role as "AGENCY_ADMIN" | "EDITOR"} 
                    name={user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

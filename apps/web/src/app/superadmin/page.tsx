import { prisma } from "@clipsflow/db";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";

export default async function SuperAdminDashboard() {
  const totalAgencies = await prisma.agency.count();
  const agencies = await prisma.agency.findMany({
    orderBy: { createdAt: 'desc' },
    include: { subscriptions: true }
  });

  const activeMrr = agencies.reduce((acc, agency) => {
    const sub = agency.subscriptions[0];
    if (sub?.plan === 'PRO') return acc + 99;
    if (sub?.plan === 'ENTERPRISE') return acc + 199;
    if (sub?.plan === 'STARTER') return acc + 49;
    return acc;
  }, 0);

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Platform Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage agencies, users, and global metrics.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">Total Agencies</h3>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Icons.briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-2">{totalAgencies}</div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">Active MRR</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Icons.billing className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-2">${activeMrr.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">Active Users</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <Icons.users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-2">142</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">Storage Used</h3>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
              <Icons.folder className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mt-2">1.2 TB</div>
        </div>
      </div>

      {/* Mocked Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Revenue Overview</h2>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            {[40, 60, 55, 75, 90, 85, 110].map((h, i) => (
              <div key={i} className="w-full bg-indigo-100 dark:bg-indigo-500/20 rounded-t-sm hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  ${h * 10}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Agency Signups</h2>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            {[10, 25, 15, 40, 35, 60, 50].map((h, i) => (
              <div key={i} className="w-full bg-emerald-100 dark:bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {h}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Active Agencies</h2>
          <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-zinc-500 dark:text-zinc-400 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Agency Details</th>
                <th className="px-6 py-4">Subdomain</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              {agencies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                    No agencies registered yet.
                  </td>
                </tr>
              ) : (
                agencies.map(agency => (
                  <tr key={agency.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
                          {agency.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{agency.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Created {new Date(agency.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                        {agency.subdomain}.clipsflow.com
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {agency.subscriptions[0]?.plan ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {agency.subscriptions[0].plan}
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500">Free Trial</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`http://${agency.subdomain}.localhost:3000/admin`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline transition-all opacity-0 group-hover:opacity-100">
                        Impersonate &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

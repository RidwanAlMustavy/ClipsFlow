import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

export default async function AgencyAdminDashboard({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const agency = await prisma.agency.findUnique({
    where: { subdomain: resolvedParams.agency },
    include: {
      users: true,
      clients: true,
    }
  });

  if (!agency) return null; // handled by layout

  const allClips = await prisma.generatedClip.findMany({
    where: {
      sourceAsset: { agencyId: agency.id },
    },
    include: {
      sourceAsset: {
        include: {
          client: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const drafts = allClips.filter(c => c.status === "DRAFT");
  const pendingClips = allClips.filter(c => c.status === "PENDING_REVIEW");
  const approved = allClips.filter(c => c.status === "APPROVED");
  const scheduled = allClips.filter(c => c.status === "SCHEDULED");
  const published = allClips.filter(c => c.status === "PUBLISHED"); // Assuming PUBLISHED exists or use something else

  const columns = [
    { title: "Drafts", count: drafts.length, clips: drafts, color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400" },
    { title: "In Review", count: pendingClips.length, clips: pendingClips, color: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30" },
    { title: "Approved", count: approved.length, clips: approved, color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30" },
    { title: "Scheduled", count: scheduled.length, clips: scheduled, color: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30" },
    { title: "Published", count: published.length, clips: published, color: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30" },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Here is what is happening with your clients today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Clips Generated</h3>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{allClips.length}</div>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">Total clips</p>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Pending Approvals</h3>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{pendingClips.length}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Requires your attention</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Active Clients</h3>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{agency.clients.length}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Out of 10 limit</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Storage</h3>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{(allClips.length * 15.4).toFixed(1)} MB</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Estimated space used</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Kanban Board */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Content Pipeline</h2>
            <Link href="/approvals" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View Approvals</Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {columns.map((col, idx) => (
              <div key={idx} className="min-w-[280px] w-72 flex-shrink-0 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-4 border border-zinc-200/60 dark:border-zinc-800/60 snap-start">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">{col.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.color}`}>{col.count}</span>
                </div>
                
                <div className="flex-1 space-y-3 min-h-[200px]">
                  {col.clips.map(clip => (
                    <div key={clip.id} className="bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 transition-colors group">
                      <div className="flex gap-2 items-center mb-2">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">{clip.format.slice(0, 4)}</span>
                        <span className="text-xs font-medium text-zinc-500 truncate">{clip.sourceAsset.client.name}</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white leading-snug line-clamp-2">
                        {clip.title || clip.sourceAsset.title || 'Generated Clip'}
                      </p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs text-zinc-400">{new Date(clip.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  
                  {col.clips.length === 0 && (
                     <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                       <span className="text-xs font-medium text-zinc-400">No items</span>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Activity & Clients */}
        <div className="space-y-8">
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {allClips.slice(0, 5).map(clip => (
                <div key={clip.id} className="flex gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                    clip.status === 'APPROVED' ? 'bg-emerald-500' :
                    clip.status === 'SCHEDULED' ? 'bg-blue-500' :
                    'bg-indigo-500'
                  }`}></div>
                  <div>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200">
                      Clip for <span className="font-semibold">{clip.sourceAsset.client.name}</span> is <span className="font-semibold">{clip.status.toLowerCase().replace('_', ' ')}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{new Date(clip.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {allClips.length === 0 && (
                <p className="text-sm text-zinc-500">No recent activity.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Active Workspaces</h2>
            </div>
            <div className="space-y-3">
              {agency.clients.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No clients yet.</p>
              ) : (
                agency.clients.slice(0, 3).map(client => (
                  <Link href={`/clients/${client.id}`} key={client.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {client.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{client.name}</span>
                    </div>
                    <Icons.chevronDown className="w-4 h-4 text-zinc-400 -rotate-90 group-hover:text-indigo-500 transition-colors" />
                  </Link>
                ))
              )}
            </div>
            <Link href="/clients" className="mt-4 w-full py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center">
              View All Clients
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

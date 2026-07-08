import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import { ScheduleClipModal } from "@/components/scheduling/schedule-clip-modal";
import { UnscheduleButton } from "@/components/scheduling/unschedule-button";

export default async function AgencySchedulingPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/api/auth/signin");
  }

  const agency = await prisma.agency.findUnique({
    where: { subdomain: resolvedParams.agency },
    include: {
      sourceAssets: {
        include: {
          client: true,
          clips: {
            where: {
              status: {
                in: ["APPROVED", "SCHEDULED"]
              }
            },
            orderBy: {
              scheduledFor: 'asc'
            }
          }
        }
      }
    }
  });

  if (!agency) return <div>Agency not found</div>;

  // Flatten the clips
  const allClips = agency.sourceAssets.flatMap(asset => 
    asset.clips.map(clip => ({
      ...clip,
      clientName: asset.client.name,
      sourceTitle: asset.title || "Uploaded Asset"
    }))
  );

  const readyClips = allClips.filter(c => c.status === "APPROVED");
  const scheduledClips = allClips.filter(c => c.status === "SCHEDULED").sort((a, b) => {
    if (!a.scheduledFor) return 1;
    if (!b.scheduledFor) return -1;
    return a.scheduledFor.getTime() - b.scheduledFor.getTime();
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Content Calendar</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Schedule approved clips for automatic posting.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Scheduled Clips Section */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Icons.calendar className="w-5 h-5 text-indigo-500" />
            Upcoming Posts
          </h2>
          
          {scheduledClips.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
              No clips are currently scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scheduledClips.map(clip => (
                <div key={clip.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex gap-4">
                  {clip.thumbnailUrl ? (
                    <div className="relative w-20 h-32 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={clip.thumbnailUrl} alt={clip.title || "Thumbnail"} className="object-cover w-full h-full" />
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1 rounded uppercase">
                        {clip.format}
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-32 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Icons.video className="w-6 h-6 text-zinc-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-white truncate pr-2">{clip.title || `Generated ${clip.format} Clip`}</h3>
                      <span className="shrink-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 text-xs font-medium px-2 py-0.5 rounded">
                        {clip.scheduledFor ? new Date(clip.scheduledFor).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        }) : "Scheduled"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 truncate mb-2">{clip.clientName}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3 mt-auto">{clip.caption}</p>
                    
                    <div className="flex gap-2 mt-auto justify-end">
                      <UnscheduleButton clipId={clip.id} />
                      <ScheduleClipModal clipId={clip.id} existingDate={clip.scheduledFor} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ready to Schedule Section */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Icons.checkCircle className="w-5 h-5 text-green-500" />
            Ready to Schedule
          </h2>
          
          {readyClips.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
              No approved clips waiting to be scheduled.
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    <th className="p-4 pl-6 w-[40%]">Clip Details</th>
                    <th className="p-4 w-[25%]">Client</th>
                    <th className="p-4 w-[20%]">Source</th>
                    <th className="p-4 pr-6 text-right w-[15%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {readyClips.map(clip => (
                    <tr key={clip.id} className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {clip.thumbnailUrl && (
                            <div className="relative w-10 h-16 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={clip.thumbnailUrl} alt="" className="object-cover w-full h-full" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-white truncate">{clip.title || `Generated ${clip.format} Clip`}</p>
                            <p className="text-xs text-zinc-500 uppercase mt-0.5">{clip.format}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400 truncate">{clip.clientName}</td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400 text-sm truncate">{clip.sourceTitle}</td>
                      <td className="p-4 pr-6 text-right">
                        <ScheduleClipModal clipId={clip.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

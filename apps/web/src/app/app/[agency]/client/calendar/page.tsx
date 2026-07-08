import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";

export default async function ClientCalendarPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CLIENT") {
    redirect("/api/auth/signin");
  }

  const clientId = (session.user as any).clientId;
  
  if (!clientId) {
    return <div>Client profile not found.</div>;
  }

  // Fetch all scheduled or published clips for this client
  const clips = await prisma.generatedClip.findMany({
    where: {
      sourceAsset: { clientId },
      status: { in: ["SCHEDULED", "PUBLISHED"] },
      scheduledFor: { not: null }
    },
    include: { sourceAsset: true },
    orderBy: { scheduledFor: 'asc' }
  });

  // Group clips by date
  const groupedClips = clips.reduce((acc: any, clip) => {
    if (!clip.scheduledFor) return acc;
    
    const date = new Date(clip.scheduledFor).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(clip);
    return acc;
  }, {});

  const dates = Object.keys(groupedClips);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Content Calendar</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Review your upcoming and previously published content schedule.</p>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center shadow-sm">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Your calendar is empty</h2>
          <p className="text-zinc-500 max-w-sm mx-auto">
            You don't have any content scheduled yet. Once your agency schedules a clip, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 sticky top-0 bg-zinc-50 dark:bg-zinc-950 py-2 z-10 border-b border-zinc-200 dark:border-zinc-800">
                {date}
              </h2>
              
              <div className="space-y-4">
                {groupedClips[date].map((clip: any) => (
                  <div key={clip.id} className="flex flex-col sm:flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="sm:w-48 aspect-video sm:aspect-auto bg-zinc-100 dark:bg-zinc-800 relative flex-shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                      {clip.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={clip.thumbnailUrl} alt={clip.title || "Clip Thumbnail"} className="w-full h-full object-cover" />
                      ) : clip.videoUrl ? (
                        <video src={clip.videoUrl} preload="metadata" className="object-cover w-full h-full" muted playsInline />
                      ) : (
                        <Icons.video className="w-8 h-8 text-zinc-400" />
                      )}
                      
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">
                          {clip.format}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase ${
                          clip.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {clip.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <Icons.clock className="w-4 h-4" />
                        {new Date(clip.scheduledFor).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-2">
                        {clip.title || "Scheduled Clip"}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2">
                        {clip.caption || "No caption provided."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

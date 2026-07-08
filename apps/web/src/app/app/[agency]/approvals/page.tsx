import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { ClipStatusUpdater } from "@/components/approvals/clip-status-updater";
import { DeleteClipButton } from "@/components/approvals/delete-clip-button";
import { ClipTitleEditor } from "@/components/approvals/clip-title-editor";

export default async function AgencyApprovalsPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
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
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!agency) return <div>Agency not found</div>;

  // Flatten the clips from all assets into a single array for the dashboard
  const allClips = agency.sourceAssets?.flatMap((asset: any) => 
    asset.clips?.map((clip: any) => ({
      ...clip,
      sourceAsset: asset,
      client: asset.client
    })) || []
  ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Approvals</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Review clips pending client approval.</p>
        </div>
      </div>

      {allClips.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
            <Icons.checkCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">You're all caught up!</h3>
          <p className="text-zinc-500 max-w-md">There are no clips currently generated. Once you generate clips and send them for review, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                <th className="p-4 pl-6">Clip Format</th>
                <th className="p-4">Client</th>
                <th className="p-4">Source Asset</th>
                <th className="p-4">Generated Date</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {allClips.map((clip: any) => (
                <tr key={clip.id} className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-zinc-900 dark:text-white">
                    <div className="flex items-center gap-4">
                      {clip.thumbnailUrl ? (
                        <div className="relative w-14 h-24 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={clip.thumbnailUrl} alt={clip.title || "Clip Thumbnail"} className="object-cover w-full h-full" />
                          <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1 rounded uppercase">
                            {clip.format}
                          </div>
                        </div>
                      ) : clip.videoUrl ? (
                        <div className="relative w-14 h-24 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                          <video src={clip.videoUrl} preload="metadata" className="object-cover w-full h-full" muted playsInline />
                          <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1 rounded uppercase">
                            {clip.format}
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-24 rounded-md bg-fuchsia-100 dark:bg-fuchsia-900/30 flex flex-col items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 flex-shrink-0 gap-1">
                          <Icons.video className="w-5 h-5" />
                          <span className="text-[10px] uppercase font-bold">{clip.format}</span>
                        </div>
                      )}
                      <div>
                        <ClipTitleEditor 
                          clipId={clip.id} 
                          initialTitle={clip.title || `Generated ${clip.format} Clip`} 
                          pathToRevalidate={`/app/${resolvedParams.agency}/approvals`} 
                          variant="list" 
                        />
                        {clip.caption && (
                          <p className="text-xs text-zinc-500 line-clamp-2 mt-1 max-w-[250px] whitespace-pre-wrap">
                            {clip.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{clip.client.name}</td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">
                    <div className="flex flex-col">
                      <span className="line-clamp-1 max-w-[150px] font-medium text-sm text-zinc-700 dark:text-zinc-300">
                        {clip.sourceAsset.title || "Uploaded Asset"}
                      </span>
                      <span className="line-clamp-1 max-w-[150px] text-xs mt-0.5">
                        {clip.title || clip.sourceAsset.title || clip.sourceAsset.youtubeUrl || "File Upload"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{new Date(clip.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/approvals/${clip.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Review
                      </Link>
                      <ClipStatusUpdater clipId={clip.id} initialStatus={clip.status} />
                      <DeleteClipButton clipId={clip.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

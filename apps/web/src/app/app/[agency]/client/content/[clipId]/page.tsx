import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import { ClipActions } from "@/components/client/clip-actions";
import Link from "next/link";
import { addComment, deleteComment, deleteClip } from "@/app/actions/clips";

export default async function ClipDetailsPage({ 
  params 
}: { 
  params: Promise<{ agency: string; clipId: string }> | { agency: string; clipId: string } 
}) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CLIENT") {
    redirect("/api/auth/signin");
  }

  const clientId = (session.user as any).clientId;

  if (!clientId) {
    return <div>Client profile not found.</div>;
  }

  const clip = await prisma.generatedClip.findFirst({
    where: {
      id: resolvedParams.clipId,
      sourceAsset: {
        clientId
      }
    },
    include: {
      sourceAsset: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!clip) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Clip Not Found</h1>
        <p>This clip does not exist or you do not have permission to view it.</p>
        <Link href={`/client`} className="text-indigo-600 hover:underline mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  // Handle Comment Submission (Server Action)
  async function submitComment(formData: FormData) {
    "use server";
    const text = formData.get("text") as string;
    if (text) {
      await addComment(clip!.id, text, `/app/${resolvedParams.agency}/client/content/${clip!.id}`);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <Link href={`/client`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 flex items-center gap-2 text-sm font-medium transition-colors w-fit">
          <Icons.chevronDown className="w-4 h-4 rotate-90" />
          Back to Hub
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Video & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Video Player */}
            <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
              {clip.videoUrl ? (
                <video src={clip.videoUrl} poster={clip.thumbnailUrl || undefined} controls className="w-full h-full object-contain" />
              ) : (
                <>
                  {clip.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={clip.thumbnailUrl} alt="Video Thumbnail" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-zinc-900" />
                  )}
                  
                  <div className="z-10 bg-white/10 backdrop-blur-md w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 hover:scale-105 transition-all border border-white/20">
                    <Icons.video className="w-6 h-6 text-white ml-1" />
                  </div>
                </>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {clip.title || clip.sourceAsset.title || clip.sourceAsset.youtubeUrl || "Untitled Clip"}
                  </h1>
                  <p className="text-sm text-zinc-500 mt-1">Generated on {new Date(clip.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {clip.format}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    clip.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                    clip.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                  }`}>
                    {clip.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {clip.caption && (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Suggested Caption</h3>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">{clip.caption}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Comments */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Action Box */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Action Required</h3>
            {clip.status === 'PENDING_REVIEW' ? (
              <ClipActions clipId={clip.id} status={clip.status} agencySubdomain={resolvedParams.agency} />
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-center border border-emerald-200 dark:border-emerald-500/20 mb-4">
                <Icons.checkCircle className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">This clip has been approved.</p>
              </div>
            )}
            
            {clip.videoUrl && (
              <div className="mt-2">
                <a href={clip.videoUrl} download target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 py-2 rounded-lg text-sm font-semibold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Clip
                </a>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <form action={async () => {
                "use server";
                await deleteClip(clip.id, resolvedParams.agency);
              }}>
                <button type="submit" className="w-full flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 border border-rose-200 dark:border-rose-900 py-2 rounded-lg text-sm font-semibold transition-colors">
                  <Icons.tool className="w-4 h-4" />
                  Delete Clip
                </button>
              </form>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col shadow-sm flex-1 overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Icons.messageSquare className="w-4 h-4" />
                Comments ({clip.comments.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {clip.comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
                  <Icons.messageSquare className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No comments yet. Leave feedback for your agency here.</p>
                </div>
              ) : (
                clip.comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {comment.user.firstName ? comment.user.firstName.charAt(0) : comment.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex justify-between group">
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-white mb-1 flex justify-between">
                            <span className="flex items-center gap-2">
                              {comment.user.firstName || comment.user.email}
                              {comment.userId === (session.user as any).id ? (
                                <span className="bg-zinc-100 border border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">You</span>
                              ) : comment.user.role !== 'CLIENT' ? (
                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">Agent</span>
                              ) : null}
                            </span>
                            <span className="text-xs text-zinc-500 font-normal ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300">{comment.text}</p>
                        </div>
                        {comment.userId === (session.user as any).id && (
                          <form action={async () => {
                            "use server";
                            await deleteComment(comment.id, `/app/${resolvedParams.agency}/client/content/${clip.id}`);
                          }}>
                            <button type="submit" className="text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete comment">
                              <Icons.tool className="w-4 h-4" />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <form action={submitComment} className="flex gap-2">
                <input 
                  type="text" 
                  name="text"
                  placeholder="Leave a comment..."
                  required
                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { deleteComment } from "@/app/actions/clips";

export default async function ClientCommentsPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CLIENT") {
    redirect("/api/auth/signin");
  }

  const clientId = (session.user as any).clientId;
  
  if (!clientId) {
    return <div>Client profile not found.</div>;
  }

  // Fetch all comments on this client's clips
  const comments = await prisma.comment.findMany({
    where: {
      clip: {
        sourceAsset: {
          clientId
        }
      }
    },
    include: {
      user: true,
      clip: {
        include: {
          sourceAsset: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Recent Comments</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Activity and feedback on all of your content.</p>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center shadow-sm">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.messageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No comments yet</h2>
          <p className="text-zinc-500 max-w-sm mx-auto">
            When you or your agency leave feedback on a clip, it will appear here in your centralized inbox.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {comments.map((comment: any) => (
              <div key={comment.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700/50 flex flex-shrink-0 items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
                  {comment.user.firstName ? comment.user.firstName.charAt(0) : comment.user.email.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-sm flex items-center gap-2 flex-wrap">
                      {comment.user.firstName ? `${comment.user.firstName} ${comment.user.lastName}` : comment.user.email}
                      {comment.userId === (session.user as any).id ? (
                        <span className="bg-zinc-100 border border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">You</span>
                      ) : comment.user.role !== 'CLIENT' ? (
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">Agent</span>
                      ) : null}
                      <span className="text-zinc-400 font-normal ml-1">
                        on {comment.clip.title || comment.clip.sourceAsset.title || comment.clip.sourceAsset.youtubeUrl || 'a clip'}
                      </span>
                    </h3>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mt-2">
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <Link href={`/client/content/${comment.clipId}`} className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline">
                      View full clip →
                    </Link>
                    
                    {comment.userId === (session.user as any).id && (
                      <form action={async () => {
                        "use server";
                        await deleteComment(comment.id, `/app/${resolvedParams.agency}/client/comments`);
                      }}>
                        <button type="submit" className="text-rose-500 hover:text-rose-700 text-xs font-medium flex items-center gap-1 transition-colors">
                          <Icons.tool className="w-3 h-3" /> Delete
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

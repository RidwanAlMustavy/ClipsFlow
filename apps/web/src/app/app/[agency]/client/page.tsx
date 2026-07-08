import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { ClipActions } from "@/components/client/clip-actions";

export default async function ClientDashboard({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CLIENT") {
    redirect("/api/auth/signin");
  }

  const clientId = (session.user as any).clientId;
  
  if (!clientId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Client Profile Not Found</h1>
        <p>Your account is not properly linked to a client workspace.</p>
      </div>
    );
  }

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      agency: { subdomain: resolvedParams.agency }
    },
    include: { agency: true }
  });

  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-xl text-zinc-600">Client workspace not found.</p>
      </div>
    );
  }

  const clips = await prisma.generatedClip.findMany({
    where: {
      sourceAsset: { clientId: client.id },
      status: { in: ["PENDING_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED"] }
    },
    include: { sourceAsset: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {client.name}'s Hub
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Review and approve your content from {client.agency.name}.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Ready for Review</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clips.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50">
              <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-lg text-zinc-700 dark:text-zinc-300">No clips to review yet</p>
              <p className="mt-1 text-sm">We'll notify you when your agency uploads new content.</p>
            </div>
          ) : (
            clips.map((clip: any, i: number) => (
              <div key={clip.id} className="group flex flex-col bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 hover:shadow-lg transition-all duration-300">
                <div className="aspect-[9/16] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10 opacity-70 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform cursor-pointer">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                      {clip.format}
                    </span>
                  </div>

                  {clip.status !== 'PENDING_REVIEW' && (
                    <div className="absolute top-3 right-3 z-20">
                      <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                        {clip.status}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 z-20">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 leading-snug">
                      {clip.title || clip.sourceAsset.title || clip.sourceAsset.youtubeUrl || `Generated Clip #${i + 1}`}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>{new Date(clip.createdAt).toLocaleDateString()}</span>
                    <span>0:45</span>
                  </div>

                  <ClipActions 
                    clipId={clip.id} 
                    status={clip.status} 
                    agencySubdomain={resolvedParams.agency} 
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

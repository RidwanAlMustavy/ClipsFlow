import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import { ClientVideoUploader } from "./client-video-uploader";

export default async function ClientContentPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CLIENT") {
    redirect("/api/auth/signin");
  }

  const clientId = (session.user as any).clientId;
  const userId = (session.user as any).id;
  const agencyId = (session.user as any).agencyId;

  if (!clientId || !agencyId) {
    return <div>Client profile not found.</div>;
  }

  // Handle form submission (Server Action inside the component for simplicity)
  async function submitVideo(formData: FormData) {
    "use server";
    
    const youtubeUrl = formData.get("youtubeUrl") as string;
    if (!youtubeUrl) return;

    await prisma.sourceAsset.create({
      data: {
        youtubeUrl,
        clientId,
        agencyId,
        uploadedById: userId,
        status: "PROCESSING"
      }
    });

    redirect("/client/content");
  }

  const assets = await prisma.sourceAsset.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">My Content</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Upload videos or YouTube links for your agency to process.</p>
        </div>
      </div>

      <ClientVideoUploader clientId={clientId} agencyId={agencyId} />

      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Processing Queue</h2>
        
        {assets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500">No videos submitted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  {asset.thumbnailUrl ? (
                    <div className="relative w-16 h-10 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.thumbnailUrl} alt={asset.title || "Thumbnail"} className="object-cover w-full h-full" />
                    </div>
                  ) : asset.fileUrl ? (
                    <div className="relative w-16 h-10 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                      <video src={asset.fileUrl} preload="metadata" className="object-cover w-full h-full" muted playsInline />
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <Icons.video className="w-4 h-4 text-white/70 drop-shadow-md" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                      <Icons.video className="w-5 h-5" />
                    </div>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    asset.status === 'READY' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                    asset.status === 'PROCESSING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {asset.status}
                  </span>
                </div>
                <div>
                  <p className="line-clamp-1 max-w-[250px] font-semibold">{asset.title || asset.youtubeUrl || "Uploaded File"}</p>
                  {(asset.youtubeUrl || asset.fileUrl) && (
                    <a href={asset.youtubeUrl || asset.fileUrl!} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline line-clamp-1 mt-0.5 max-w-[250px]">
                      {asset.youtubeUrl || "View Uploaded File"}
                    </a>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Submitted on {new Date(asset.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

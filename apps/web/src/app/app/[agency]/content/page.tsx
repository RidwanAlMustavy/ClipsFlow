import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import { UploadAssetModal } from "@/components/content/upload-asset-modal";
import { GenerateClipsModal } from "@/components/content/generate-clips-modal";
import { StatusBadgeToggle } from "@/components/content/status-badge-toggle";
import { DeleteAssetButton } from "@/components/content/delete-asset-button";

export default async function AgencyContentPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/api/auth/signin");
  }

  const agency = await prisma.agency.findUnique({
    where: { subdomain: resolvedParams.agency },
    include: { 
      sourceAssets: { include: { client: true } },
      clients: true 
    }
  });

  if (!agency) return <div>Agency not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Content Library</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage source assets and generate clips for your clients.</p>
        </div>
        <UploadAssetModal clients={agency.clients} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              <th className="p-4 pl-6">Asset Details</th>
              <th className="p-4">Client</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agency.sourceAssets.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  No source assets found. Upload one or wait for clients to submit.
                </td>
              </tr>
            ) : (
              agency.sourceAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-zinc-900 dark:text-white">
                    <div className="flex items-center gap-4">
                      {asset.thumbnailUrl ? (
                        <div className="relative w-24 h-14 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={asset.thumbnailUrl} alt={asset.title || "Thumbnail"} className="object-cover w-full h-full" />
                          {asset.duration && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1 rounded">
                              {Math.floor(asset.duration / 60)}:{String(asset.duration % 60).padStart(2, '0')}
                            </div>
                          )}
                        </div>
                      ) : asset.fileUrl ? (
                        <div className="relative w-24 h-14 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                          <video src={asset.fileUrl} preload="metadata" className="object-cover w-full h-full" muted playsInline />
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <Icons.video className="w-5 h-5 text-white/70 drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                          <Icons.video className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="line-clamp-1 max-w-[250px] font-semibold">{asset.title || asset.youtubeUrl || "File Upload"}</p>
                        {(asset.youtubeUrl || asset.fileUrl) && (
                          <a href={asset.youtubeUrl || asset.fileUrl!} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline line-clamp-1 mt-0.5 max-w-[250px]">
                            {asset.youtubeUrl || "View Uploaded File"}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{asset.client.name}</td>
                  <td className="p-4">
                    <StatusBadgeToggle assetId={asset.id} initialStatus={asset.status as "PROCESSING" | "READY" | "FAILED"} />
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <GenerateClipsModal assetId={asset.id} />
                      <DeleteAssetButton assetId={asset.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

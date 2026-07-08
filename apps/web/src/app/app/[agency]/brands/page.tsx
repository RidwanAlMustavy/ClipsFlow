import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import { BrandKitModal } from "@/components/brands/brand-kit-modal";
import { DeleteBrandButton } from "@/components/brands/delete-brand-button";

export default async function AgencyBrandsPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/api/auth/signin");
  }

  const agency = await prisma.agency.findUnique({
    where: { subdomain: resolvedParams.agency },
    include: {
      clients: {
        include: {
          brandKits: true
        }
      }
    }
  });

  if (!agency) return <div>Agency not found</div>;

  // Flatten brand kits
  const allBrandKits = agency.clients.flatMap(client => 
    client.brandKits.map(bk => ({
      ...bk,
      clientName: client.name
    }))
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Brand Kits</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage brand colors, fonts, and logos for your clients.</p>
        </div>
        <BrandKitModal clients={agency.clients} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BrandKitModal 
          clients={agency.clients} 
          trigger={
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer min-h-[250px] h-full">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-full mb-4">
                <Icons.layout className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">New Brand Kit</h3>
              <p className="text-xs text-zinc-500 mt-1">Set up custom branding for a client.</p>
            </div>
          } 
        />
        
        {allBrandKits.map(kit => (
          <BrandKitModal
            key={kit.id}
            clients={agency.clients}
            existingKit={kit}
            trigger={
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer overflow-hidden flex flex-col h-full relative group">
                
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteBrandButton brandKitId={kit.id} />
                </div>

                <div className="h-32 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative p-4">
                  {kit.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={kit.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  ) : (
                    <span className="text-zinc-400 text-sm font-medium">No Logo Provided</span>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg line-clamp-1">{kit.clientName}</h3>
                  </div>
                  
                  <div className="space-y-4 mt-auto">
                    <div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Colors</span>
                      {kit.colors ? (
                        <div className="flex gap-2 flex-wrap">
                          {kit.colors.split(',').map((color, i) => (
                            <div 
                              key={i} 
                              className="w-8 h-8 rounded-full border border-zinc-200 shadow-sm" 
                              style={{ backgroundColor: color.trim() }}
                              title={color.trim()}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">None specified</span>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Fonts</span>
                      {kit.fonts ? (
                        <div className="flex gap-2 flex-wrap">
                          {kit.fonts.split(',').map((font, i) => (
                            <span key={i} className="text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-700 dark:text-zinc-300 font-medium">
                              {font.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">None specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}

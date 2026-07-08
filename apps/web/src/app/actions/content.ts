"use server";

import { prisma } from "@clipsflow/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function uploadAgencyAsset(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { error: "Unauthorized" };
  }

  const role = (session.user as any).role;
  const isAgency = role === "AGENCY_ADMIN" || role === "SUPER_ADMIN";
  const isClient = role === "CLIENT";

  if (!isAgency && !isClient) {
    return { error: "Unauthorized" };
  }

  const youtubeUrl = formData.get("youtubeUrl") as string;
  const fileUrl = formData.get("fileUrl") as string;
  const clientId = formData.get("clientId") as string;
  const title = formData.get("title") as string;
  
  // Clients can only upload to their own clientId
  if (isClient && (session.user as any).clientId !== clientId) {
    return { error: "Unauthorized for this client" };
  }

  const agencyId = (session.user as any).agencyId;
  const uploadedById = (session.user as any).id;

  if ((!youtubeUrl && !fileUrl) || !clientId || !agencyId) {
    return { error: "Missing required fields" };
  }

  try {
    const asset = await prisma.sourceAsset.create({
      data: {
        youtubeUrl,
        fileUrl,
        clientId,
        agencyId,
        uploadedById,
        status: "PROCESSING",
        title: title || (fileUrl ? `Uploaded File` : `YouTube Asset ${Math.floor(Math.random() * 1000)}`),
        thumbnailUrl: fileUrl ? null : `https://picsum.photos/seed/${Math.random()}/800/450`,
        duration: fileUrl ? null : Math.floor(Math.random() * 3600) + 120, // 2-60 mins for youtube
        transcription: "This is a mock transcription of the uploaded asset. In this video, we cover several important topics..."
      }
    });

    revalidatePath("/content");
    return { success: true, asset };
  } catch (error) {
    console.error("Error creating asset:", error);
    return { error: "Failed to upload asset" };
  }
}

export async function updateAssetStatus(assetId: string, status: "PROCESSING" | "READY" | "FAILED") {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;

  try {
    await prisma.sourceAsset.updateMany({
      where: { id: assetId, agencyId },
      data: { status }
    });

    revalidatePath("/content");
    return { success: true };
  } catch (error) {
    console.error("Error updating asset status:", error);
    return { error: "Failed to update asset status" };
  }
}

export async function generateClips(assetId: string, formats: string[]) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;

  try {
    // Verify asset belongs to agency
    const asset = await prisma.sourceAsset.findFirst({
      where: { id: assetId, agencyId }
    });

    if (!asset) {
      return { error: "Asset not found" };
    }

    // Process clips in the background or await them?
    // In production, we'd fire a background job. Locally, we can await it since timeout is long.
    const clipPromises = formats.map(async (format) => {
      // Create a draft clip first
      const clip = await prisma.generatedClip.create({
        data: {
          sourceAssetId: assetId,
          format: format as any,
          status: "PROCESSING",
          title: `${format}-"${asset.title || 'Video'}"`,
          thumbnailUrl: asset.thumbnailUrl,
          caption: `Check out this amazing ${format} clip we generated from the original video! #viral #trending`,
        }
      });

      try {
        const { processVideoAndUpload } = await import("@/utils/video-processor");
        const sourceUrl = asset.fileUrl || asset.youtubeUrl;
        const isYoutube = !asset.fileUrl && !!asset.youtubeUrl;
        
        if (!sourceUrl) throw new Error("No source URL available");

        const result = await processVideoAndUpload(sourceUrl, isYoutube, format, assetId);
        
        if (result.success && result.fileUrl) {
          await prisma.generatedClip.update({
            where: { id: clip.id },
            data: {
              status: "PENDING_REVIEW",
              videoUrl: result.fileUrl,
              thumbnailUrl: asset.thumbnailUrl
            }
          });
        } else {
          throw new Error(result.error || "Unknown processing error");
        }
      } catch (err) {
        console.error("Clip processing failed:", err);
        await prisma.generatedClip.update({
          where: { id: clip.id },
          data: { status: "FAILED" }
        });
      }
    });

    // We can run these concurrently.
    // NOTE: In a real Next.js app, this might block the response or get killed if on Vercel.
    // For this local prototype, we will await all of them.
    await Promise.all(clipPromises);

    // If it was processing, maybe mark it ready since we generated clips
    if (asset.status === "PROCESSING") {
      await prisma.sourceAsset.update({
        where: { id: assetId },
        data: { status: "READY" }
      });
    }

    revalidatePath("/content");
    return { success: true };
  } catch (error) {
    console.error("Error generating clips:", error);
    return { error: "Failed to generate clips" };
  }
}

export async function deleteAgencyAsset(assetId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;

  try {
    // Verify asset belongs to agency
    const asset = await prisma.sourceAsset.findFirst({
      where: { id: assetId, agencyId }
    });

    if (!asset) {
      return { error: "Asset not found or unauthorized" };
    }

    // Delete associated clips first to avoid foreign key constraint errors
    await prisma.generatedClip.deleteMany({
      where: { sourceAssetId: assetId }
    });

    // Now delete the source asset
    await prisma.sourceAsset.delete({
      where: { id: assetId }
    });

    revalidatePath("/content");
    return { success: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { error: "Failed to delete asset" };
  }
}

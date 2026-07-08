"use server";

import { prisma } from "@clipsflow/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { ClipStatus } from "@clipsflow/db";

export async function updateClipStatus(clipId: string, status: ClipStatus) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;

  try {
    // Verify clip belongs to agency via SourceAsset
    const clip = await prisma.generatedClip.findFirst({
      where: { 
        id: clipId,
        sourceAsset: {
          agencyId
        }
      }
    });

    if (!clip) {
      return { error: "Clip not found or unauthorized" };
    }

    await prisma.generatedClip.update({
      where: { id: clipId },
      data: { status }
    });

    revalidatePath("/approvals");
    return { success: true };
  } catch (error) {
    console.error("Error updating clip status:", error);
    return { error: "Failed to update clip status" };
  }
}

export async function deleteClip(clipId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;

  try {
    // Verify clip belongs to agency via SourceAsset
    const clip = await prisma.generatedClip.findFirst({
      where: { 
        id: clipId,
        sourceAsset: {
          agencyId
        }
      }
    });

    if (!clip) {
      return { error: "Clip not found or unauthorized" };
    }

    // Delete associated comments first to avoid foreign key errors
    await prisma.comment.deleteMany({
      where: { clipId }
    });

    await prisma.generatedClip.delete({
      where: { id: clipId }
    });

    revalidatePath("/approvals");
    return { success: true };
  } catch (error) {
    console.error("Error deleting clip:", error);
    return { error: "Failed to delete clip" };
  }
}

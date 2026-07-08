"use server";

import { prisma } from "@clipsflow/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function scheduleClip(clipId: string, scheduledFor: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;

  try {
    const clip = await prisma.generatedClip.findFirst({
      where: { 
        id: clipId,
        sourceAsset: { agencyId }
      }
    });

    if (!clip) {
      return { error: "Clip not found" };
    }

    if (clip.status !== "APPROVED" && clip.status !== "SCHEDULED") {
      return { error: "Clip must be approved before scheduling" };
    }

    await prisma.generatedClip.update({
      where: { id: clipId },
      data: {
        scheduledFor: new Date(scheduledFor),
        status: "SCHEDULED"
      }
    });

    revalidatePath("/scheduling");
    return { success: true };
  } catch (error) {
    console.error("Error scheduling clip:", error);
    return { error: "Failed to schedule clip" };
  }
}

export async function unscheduleClip(clipId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;

  try {
    const clip = await prisma.generatedClip.findFirst({
      where: { 
        id: clipId,
        sourceAsset: { agencyId }
      }
    });

    if (!clip) {
      return { error: "Clip not found" };
    }

    await prisma.generatedClip.update({
      where: { id: clipId },
      data: {
        scheduledFor: null,
        status: "APPROVED"
      }
    });

    revalidatePath("/scheduling");
    return { success: true };
  } catch (error) {
    console.error("Error unscheduling clip:", error);
    return { error: "Failed to unschedule clip" };
  }
}

"use server";

import { prisma } from "@clipsflow/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function createBrandKit(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const clientId = formData.get("clientId") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const colors = formData.get("colors") as string;
  const fonts = formData.get("fonts") as string;
  const agencyId = (session.user as any).agencyId;

  if (!clientId || !agencyId) {
    return { error: "Missing required fields" };
  }

  try {
    // Verify client belongs to agency
    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId }
    });

    if (!client) {
      return { error: "Client not found" };
    }

    const brandKit = await prisma.brandKit.create({
      data: {
        clientId,
        logoUrl: logoUrl || undefined,
        colors: colors || undefined,
        fonts: fonts || undefined
      }
    });

    revalidatePath("/brands");
    return { success: true, brandKit };
  } catch (error) {
    console.error("Error creating brand kit:", error);
    return { error: "Failed to create brand kit" };
  }
}

export async function updateBrandKit(brandKitId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const logoUrl = formData.get("logoUrl") as string;
  const colors = formData.get("colors") as string;
  const fonts = formData.get("fonts") as string;
  const agencyId = (session.user as any).agencyId;

  try {
    // Verify brand kit belongs to a client of this agency
    const brandKit = await prisma.brandKit.findFirst({
      where: { 
        id: brandKitId,
        client: { agencyId }
      }
    });

    if (!brandKit) {
      return { error: "Brand kit not found" };
    }

    await prisma.brandKit.update({
      where: { id: brandKitId },
      data: {
        logoUrl: logoUrl || null,
        colors: colors || null,
        fonts: fonts || null
      }
    });

    revalidatePath("/brands");
    return { success: true };
  } catch (error) {
    console.error("Error updating brand kit:", error);
    return { error: "Failed to update brand kit" };
  }
}

export async function deleteBrandKit(brandKitId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;

  try {
    const brandKit = await prisma.brandKit.findFirst({
      where: { 
        id: brandKitId,
        client: { agencyId }
      }
    });

    if (!brandKit) {
      return { error: "Brand kit not found" };
    }

    await prisma.brandKit.delete({
      where: { id: brandKitId }
    });

    revalidatePath("/brands");
    return { success: true };
  } catch (error) {
    console.error("Error deleting brand kit:", error);
    return { error: "Failed to delete brand kit" };
  }
}

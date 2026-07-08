"use server";

import { prisma } from "@clipsflow/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export async function inviteAgencyMember(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const role = formData.get("role") as Role;
  const agencyId = (session.user as any).agencyId;

  if (!email || !role || !agencyId) {
    return { error: "Missing required fields" };
  }

  const bcrypt = require("bcrypt");
  const passwordHash = await bcrypt.hash("password123", 10); // Default password for demo

  try {
    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        agencyId
      }
    });

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { error: "A user with this email address already exists." };
    }
    console.error("Error inviting team member:", error);
    return { error: "Failed to invite team member" };
  }
}

export async function updateAgencyMemberRole(userId: string, role: Role) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;
  const currentUserId = (session.user as any).id;

  if (userId === currentUserId) {
    return { error: "You cannot change your own role" };
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, agencyId }
    });

    if (!user) {
      return { error: "User not found or unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    console.error("Error updating team member role:", error);
    return { error: "Failed to update team member role" };
  }
}

export async function removeAgencyMember(userId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return { error: "Unauthorized" };
  }

  const agencyId = (session.user as any).agencyId;
  const currentUserId = (session.user as any).id;

  if (userId === currentUserId) {
    return { error: "You cannot remove yourself" };
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, agencyId }
    });

    if (!user) {
      return { error: "User not found or unauthorized" };
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    console.error("Error removing team member:", error);
    return { error: "Failed to remove team member" };
  }
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@clipsflow/db";
import { revalidatePath } from "next/cache";

export async function approveClip(clipId: string, pathToRevalidate?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Ensure the user is a client or agency admin
  const role = (session.user as any).role;
  if (role !== "CLIENT" && role !== "AGENCY_ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized role");
  }

  // Update the clip
  await prisma.generatedClip.update({
    where: { id: clipId },
    data: { status: "APPROVED" }
  });

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
}

export async function addComment(clipId: string, text: string, pathToRevalidate?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  if (!text || text.trim() === "") {
    throw new Error("Comment text cannot be empty");
  }

  // Create the comment
  await prisma.comment.create({
    data: {
      text,
      userId,
      clipId
    }
  });

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
}

export async function deleteComment(commentId: string, pathToRevalidate: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const userId = (session.user as any).id;
  
  // Ensure the comment exists and belongs to the user (or user is admin)
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Comment not found");
  
  const role = (session.user as any).role;
  if (comment.userId !== userId && role !== "AGENCY_ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized to delete this comment");
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(pathToRevalidate);
}

export async function deleteClip(clipId: string, agencySubdomain: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const role = (session.user as any).role;
  if (role !== "CLIENT" && role !== "AGENCY_ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized to delete this clip");
  }

  // Delete the clip (this deletes comments automatically if cascading is set up, otherwise we should delete them first)
  // Let's delete comments first just in case
  await prisma.comment.deleteMany({ where: { clipId } });
  await prisma.generatedClip.delete({ where: { id: clipId } });

  // Revalidate the client portal
  revalidatePath(`/app/${agencySubdomain}/client`);
}

export async function updateClipTitle(clipId: string, title: string, pathToRevalidate?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Ensure the user is a client or agency admin
  const role = (session.user as any).role;
  if (role !== "CLIENT" && role !== "AGENCY_ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized role");
  }

  if (!title || title.trim() === "") {
    throw new Error("Title cannot be empty");
  }

  // Update the clip
  await prisma.generatedClip.update({
    where: { id: clipId },
    data: { title: title.trim() }
  });

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
}

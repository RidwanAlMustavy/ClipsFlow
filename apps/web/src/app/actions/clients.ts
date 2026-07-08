"use server";

import { prisma } from "@clipsflow/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const gender = formData.get("gender") as string;
  const agencyId = (session.user as any).agencyId;

  if (!name || !email || !password || !agencyId) {
    throw new Error("Missing required fields");
  }

  const bcrypt = require("bcrypt");
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const client = await prisma.client.create({
      data: {
        name,
        agencyId,
        users: {
          create: {
            email,
            firstName,
            lastName,
            passwordHash,
            phoneNumber,
            gender,
            role: "CLIENT",
            agencyId
          }
        }
      }
    });

    revalidatePath("/clients");
    return { success: true, client };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { error: "A user with this email address already exists." };
    }
    return { error: "An unexpected error occurred while creating the client." };
  }
}

export async function updateClient(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  if (!name) throw new Error("Missing name");

  const agencyId = (session.user as any).agencyId;
  const client = await prisma.client.updateMany({
    where: { id, agencyId },
    data: { name }
  });

  const userId = formData.get("userId") as string;
  if (userId) {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const gender = formData.get("gender") as string;

    await prisma.user.updateMany({
      where: { id: userId, clientId: id, agencyId },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        gender
      }
    });
  }

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  return { success: true };
}

export async function inviteClientUser(clientId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const email = formData.get("email") as string;
  if (!email) throw new Error("Missing email");

  const agencyId = (session.user as any).agencyId;
  
  // Verify client belongs to agency
  const client = await prisma.client.findFirst({
    where: { id: clientId, agencyId }
  });
  if (!client) throw new Error("Client not found");

  // In a real app we'd email them a magic link or password setup.
  // For this demo, we'll assign a default password and bcrypt it.
  const bcrypt = require("bcrypt");
  const passwordHash = await bcrypt.hash("password123", 10);

  try {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "CLIENT",
        clientId,
        agencyId
      }
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { error: "A user with this email address already exists." };
    }
    return { error: "An unexpected error occurred while inviting the user." };
  }
}

export async function removeClientUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const agencyId = (session.user as any).agencyId;

  // Ensure user belongs to the agency
  const targetUser = await prisma.user.findFirst({
    where: { id: userId, agencyId }
  });
  if (!targetUser || targetUser.role !== "CLIENT") {
    throw new Error("Invalid user");
  }

  await prisma.user.delete({
    where: { id: userId }
  });

  revalidatePath(`/clients/${targetUser.clientId}`);
  return { success: true };
}

export async function deleteClient(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const agencyId = (session.user as any).agencyId;
  
  try {
    await prisma.user.deleteMany({
      where: { clientId: id, agencyId }
    });

    await prisma.client.deleteMany({
      where: { id, agencyId }
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    return { error: "An unexpected error occurred while deleting the client." };
  }
}

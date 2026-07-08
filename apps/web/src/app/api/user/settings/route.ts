import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@clipsflow/db";
import * as bcrypt from "bcrypt";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, email, phoneNumber, gender, oldPassword, newPassword } = await req.json();
    const userId = (session.user as any).id;

    // Build update data
    const updateData: any = {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
    };

    // If attempting to change password
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json({ error: "Old password is required to set a new password." }, { status: 400 });
      }

      const currentUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!currentUser || !currentUser.passwordHash) {
        return NextResponse.json({ error: "User not found or cannot change password." }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(oldPassword, currentUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect old password." }, { status: 400 });
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Hard delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

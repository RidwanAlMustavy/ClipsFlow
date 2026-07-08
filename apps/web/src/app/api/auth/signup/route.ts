import { NextResponse } from "next/server";
import { prisma } from "@clipsflow/db";
import * as bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, role, gender, phoneNumber } = await req.json();

    if (!email || !password || !firstName || !lastName || !role || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        passwordHash,
        role: role as any,
        ...(role === "AGENCY_ADMIN" ? {
          agency: {
            create: {
              name: `${firstName}'s Agency`,
              subdomain: `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(Math.random() * 1000)}`,
            }
          }
        } : {
          // If they sign up as a CLIENT, automatically create a workspace for them under the demo agency
          agency: { connect: { subdomain: 'demo' } },
          client: {
            create: {
              name: `${firstName}'s Workspace`,
              agency: { connect: { subdomain: 'demo' } }
            }
          }
        })
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

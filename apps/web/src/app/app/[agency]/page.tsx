import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";

export default async function AgencyRoot({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const role = (session.user as any).role;
  const isAgencyAdmin = role === "AGENCY_ADMIN" || role === "SUPER_ADMIN";
  const isClient = role === "CLIENT";

  if (isAgencyAdmin) {
    redirect(`/admin`);
  } else if (isClient) {
    redirect(`/client`);
  } else {
    redirect("/api/auth/signin");
  }
}

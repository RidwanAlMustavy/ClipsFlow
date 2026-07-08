import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@clipsflow/db";
import { Queue } from 'bullmq';

// Create a queue instance
const videoQueue = new Queue('video-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "AGENCY_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientId, youtubeUrl } = await req.json();

    if (!clientId || !youtubeUrl) {
      return NextResponse.json({ error: "clientId and youtubeUrl are required" }, { status: 400 });
    }

    const agencyId = (session.user as any).agencyId;

    // 1. Create a SourceAsset in processing state
    const sourceAsset = await prisma.sourceAsset.create({
      data: {
        agencyId,
        clientId,
        uploadedById: (session.user as any).id,
        youtubeUrl,
        status: "PROCESSING"
      }
    });

    // 2. Enqueue the job for the worker
    await videoQueue.add('process-video', {
      assetId: sourceAsset.id,
      youtubeUrl
    });

    return NextResponse.json({ success: true, assetId: sourceAsset.id });
  } catch (error: any) {
    console.error("Error queueing video:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

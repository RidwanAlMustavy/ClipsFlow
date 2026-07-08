import { Worker, Job } from 'bullmq';
import { prisma } from '@clipsflow/db';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const videoProcessingWorker = new Worker('video-processing', async (job: Job) => {
  console.log(`Processing job ${job.id} for asset ${job.data.assetId} with URL ${job.data.youtubeUrl}`);
  
  // 1. Simulate AI downloading and processing the video
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 2. Generate mock clips for the dashboard
  const formats: ('TIKTOK' | 'REELS' | 'LINKEDIN')[] = ['TIKTOK', 'REELS', 'LINKEDIN'];
  
  for (const format of formats) {
    await prisma.generatedClip.create({
      data: {
        sourceAssetId: job.data.assetId,
        format,
        status: 'PENDING_REVIEW', // Needs agency editor approval first
      }
    });
  }
  
  // 3. Mark the SourceAsset as READY
  await prisma.sourceAsset.update({
    where: { id: job.data.assetId },
    data: { status: 'READY' }
  });
  
  console.log(`Job ${job.id} completed. Generated ${formats.length} clips for review.`);
}, { connection });

videoProcessingWorker.on('completed', job => {
  console.log(`Job ${job.id} has completed successfully!`);
});

videoProcessingWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});

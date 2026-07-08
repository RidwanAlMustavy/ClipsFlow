import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import { GoogleGenAI } from '@google/genai';
import ytdl from 'ytdl-core';

// Manually resolve ffmpeg binary because Next.js bundling breaks __dirname in ffmpeg-static
const possiblePaths = [
  path.join(process.cwd(), '../../node_modules/ffmpeg-static/ffmpeg.exe'),
  path.join(process.cwd(), 'node_modules/ffmpeg-static/ffmpeg.exe')
];

let ffmpegPath = '';
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    ffmpegPath = p;
    break;
  }
}

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  console.warn("WARNING: Could not find ffmpeg.exe statically.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ClipFormatOptions {
  width: number;
  height: number;
}

const FORMAT_MAP: Record<string, ClipFormatOptions> = {
  TIKTOK: { width: 1080, height: 1920 },
  REELS: { width: 1080, height: 1920 },
  LINKEDIN: { width: 1080, height: 1080 },
  THREAD: { width: 1080, height: 1920 },
  NEWSLETTER: { width: 1920, height: 1080 }
};

export async function processVideoAndUpload(
  sourceUrl: string, 
  isYoutube: boolean,
  format: string,
  assetId: string
) {
  const tempDir = os.tmpdir();
  const sessionId = crypto.randomUUID();
  const rawVideoPath = path.join(tempDir, `${sessionId}-raw.mp4`);
  const finalClipPath = path.join(tempDir, `${sessionId}-clip.mp4`);

  try {
    console.log(`Starting video processing for ${assetId}...`);

    // 1. Download Video
    console.log(`Downloading source video...`);
    await downloadVideo(sourceUrl, rawVideoPath, isYoutube);

    // 2. Get Highlight Timestamps (Gemini AI or fallback)
    console.log(`Analyzing video for highlights...`);
    const { startTime, duration } = await getHighlightTimestamps(rawVideoPath);
    console.log(`Selected highlight: ${startTime} to ${startTime + duration}s`);

    // 3. Crop and Trim with FFmpeg
    console.log(`Cropping and trimming video...`);
    const formatOpts = FORMAT_MAP[format] || FORMAT_MAP['TIKTOK'];
    await cropAndTrimVideo(rawVideoPath, finalClipPath, startTime, duration, formatOpts);

    // 4. Upload to Uploadthing
    console.log(`Uploading final clip to Uploadthing...`);
    const fileUrl = await uploadToStorage(finalClipPath, `clip-${format}-${assetId}.mp4`);
    
    return { success: true, fileUrl };

  } catch (error: any) {
    console.error(`Video processing failed:`, error);
    return { success: false, error: error.message };
  } finally {
    // Cleanup temp files
    try {
      if (fs.existsSync(rawVideoPath)) fs.unlinkSync(rawVideoPath);
      if (fs.existsSync(finalClipPath)) fs.unlinkSync(finalClipPath);
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  }
}

async function downloadVideo(url: string, outputPath: string, isYoutube: boolean): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (isYoutube) {
      const stream = ytdl(url, { quality: 'highestvideo' });
      stream.pipe(fs.createWriteStream(outputPath))
        .on('finish', () => resolve())
        .on('error', (err) => reject(err));
    } else {
      // It's a direct file URL (e.g. from Uploadthing)
      try {
        const res = await fetch(url);
        if (!res.ok || !res.body) throw new Error("Failed to fetch video file");
        
        // Convert ReadableStream to Node stream
        const dest = fs.createWriteStream(outputPath);
        const reader = res.body.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          dest.write(value);
        }
        dest.end();
        resolve();
      } catch (err) {
        reject(err);
      }
    }
  });
}

async function getHighlightTimestamps(videoPath: string): Promise<{ startTime: number, duration: number }> {
  // If no Gemini key, fallback to a random 15 second clip starting at 10s
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY provided. Falling back to default timestamps.");
    return { startTime: 10, duration: 15 };
  }

  // To keep processing fast for now, we will extract audio and ask Gemini to analyze it.
  // Full video upload to Gemini takes a lot of time via File API.
  // For this prototype, we'll just extract a fixed 15 second clip to demonstrate the pipeline
  // before building full Gemini audio-extraction pipeline.
  // (Full Gemini integration would extract audio with ffmpeg, upload to Gemini, and parse JSON response).
  
  return { startTime: 10, duration: 15 };
}

async function cropAndTrimVideo(
  inputPath: string, 
  outputPath: string, 
  startTime: number, 
  duration: number,
  format: ClipFormatOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      // Center crop for the requested format
      .videoFilters([
        {
          filter: 'crop',
          options: {
            w: `ih*(${format.width}/${format.height})`,
            h: 'ih',
            x: `(iw-ow)/2`,
            y: 0
          }
        },
        {
          filter: 'scale',
          options: { w: format.width, h: format.height }
        }
      ])
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-strict experimental',
        '-b:a 192k'
      ])
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
}

async function uploadToStorage(filePath: string, fileName: string): Promise<string> {
  // Wait, uploadthing provides UTApi for server-side uploads!
  // Let's dynamically import it assuming it's available.
  const { UTApi } = await import("uploadthing/server");
  const utapi = new UTApi();
  
  const fileBuffer = fs.readFileSync(filePath);
  
  // Use Blob directly for uploadthing v7 UTApi
  const blob = new Blob([fileBuffer], { type: "video/mp4" });
  // Add a name property to the blob to simulate a File object
  (blob as any).name = fileName;
  
  const response = await utapi.uploadFiles([blob as any]);
  
  if (response[0].error) {
    throw new Error(response[0].error.message);
  }
  
  return response[0].data.url;
}

import { NextResponse } from 'next/server';
import cloudinary from '@/app/cloudinary';

export async function POST(request: Request) {
  const data = await request.json();
  const { fileName } = data;

  const timestamp = Math.round((new Date).getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp,
    folder: 'cheatchat',
    public_id: `cheatchat/${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}`,
  }, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: 'cheatchat',
    publicId: `cheatchat/${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}`,
  });
}

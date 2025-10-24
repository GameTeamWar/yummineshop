import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.YT_CLIENT_ID;
  const redirectUri = process.env.YT_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      error: 'YouTube API credentials not configured'
    }, { status: 500 });
  }

  // YouTube OAuth URL'ini oluştur
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'https://www.googleapis.com/auth/youtube.upload',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent' // Her zaman izin sor
    }).toString();

  return NextResponse.json({ authUrl });
}
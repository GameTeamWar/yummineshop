import { google } from "googleapis";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const file = body.get("video") as File;
    const title = body.get("title") as string || "Kullanıcı Yorum Videosu";
    const description = body.get("description") as string || "Otomatik yüklenmiş video yorumu";

    if (!file) {
      return Response.json({ error: "Video dosyası gerekli" }, { status: 400 });
    }

    // Geçici dosya oluştur
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = path.join(process.cwd(), "tmp");

    // tmp klasörü yoksa oluştur
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, `video_${Date.now()}_${file.name}`);
    fs.writeFileSync(tempPath, buffer);

    // YouTube API kimlik doğrulama
    const oauth2Client = new google.auth.OAuth2(
      process.env.YT_CLIENT_ID,
      process.env.YT_CLIENT_SECRET,
      process.env.YT_REDIRECT_URI
    );

    // Token'ları ayarla (environment variables'dan)
    oauth2Client.setCredentials({
      access_token: process.env.YT_ACCESS_TOKEN,
      refresh_token: process.env.YT_REFRESH_TOKEN,
    });

    // Token'ları yenilemeyi dene (eğer expire olduysa)
    try {
      const newTokens = await oauth2Client.refreshAccessToken();
      if (newTokens.credentials.access_token) {
        oauth2Client.setCredentials(newTokens.credentials);
        console.log('Token refreshed successfully');
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      return Response.json({
        error: "YouTube yetkilendirmesi gerekli. Lütfen önce YouTube hesabınızı bağlayın.",
        code: "AUTH_REQUIRED"
      }, { status: 401 });
    }

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Video yükleme
    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title,
          description: description,
          tags: ["yorum", "müşteri", "video"],
        },
        status: {
          privacyStatus: "unlisted", // unlisted, private, veya public
        },
      },
      media: {
        body: fs.createReadStream(tempPath),
      },
    });

    // Geçici dosyayı temizle
    fs.unlinkSync(tempPath);

    return Response.json({
      success: true,
      videoId: res.data.id,
      videoUrl: `https://www.youtube.com/watch?v=${res.data.id}`,
      embedUrl: `https://www.youtube.com/embed/${res.data.id}`
    });

  } catch (err: any) {
    console.error("YouTube upload error:", err);
    return Response.json({
      error: err.message || "Video yükleme hatası",
      details: err.response?.data
    }, { status: 500 });
  }
}
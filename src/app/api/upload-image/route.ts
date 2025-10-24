import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const file = body.get("image");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "Görsel dosyası gerekli" }, { status: 400 });
    }

    // Dosya türünü kontrol et
    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Sadece görsel dosyaları kabul edilir" }, { status: 400 });
    }

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Dosya boyutu 5MB'dan büyük olamaz" }, { status: 400 });
    }

    // Benzersiz dosya adı oluştur
    const fileExtension = path.extname(file.name);
    const fileName = `review_image_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExtension}`;

    // public/reviews klasörü oluştur
    const uploadDir = path.join(process.cwd(), "public", "reviews");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Public URL oluştur
    const imageUrl = `/reviews/${fileName}`;

    return Response.json({
      success: true,
      imageUrl: imageUrl,
      fileName: fileName
    });

  } catch (err: any) {
    console.error("Image upload error:", err);
    return Response.json({
      error: err.message || "Görsel yükleme hatası"
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(request: NextRequest) {
  try {
    const { email, additionalData } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email adresi gerekli" }, { status: 400 });
    }

    // SendGrid API key kontrolü
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendGridApiKey) {
      console.error("SendGrid API key bulunamadı");
      return NextResponse.json({ error: "Email servisi yapılandırılmamış" }, { status: 500 });
    }

    // SendGrid yapılandırması
    sgMail.setApiKey(sendGridApiKey);

    // Email içeriği oluştur
    const emailContent = generateRegistrationEmailContent(email, additionalData);

    // Email subject'ini belirle
    const subject = additionalData?.isAuthorized
      ? `Yummine Mağaza Yetkilendirmesi - ${additionalData.storeName}`
      : "Yummine Partner Kaydı Başarılı - Giriş Bilgileriniz";

    // SendGrid ile email gönder
    const msg = {
      to: email,
      from: {
        email: "noreply@yummine.com",
        name: "Yummine Platform"
      },
      subject: subject,
      html: emailContent,
      text: generatePlainTextEmail(email, additionalData), // Plain text versiyonu ekle
      encoding: 'utf-8', // UTF-8 encoding belirt
    };

    await sgMail.send(msg);

    console.log("Email başarıyla gönderildi:", {
      to: email,
      subject: subject,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Email başarıyla gönderildi",
      email: email
    });

  } catch (error) {
    console.error("Email gönderme hatası:", error);
    return NextResponse.json({
      error: "Email gönderilemedi",
      details: error instanceof Error ? error.message : "Bilinmeyen hata"
    }, { status: 500 });
  }
}

function generateRegistrationEmailContent(email: string, additionalData?: any): string {
  const isStore = additionalData?.partnerType === "store";
  const isCourier = additionalData?.partnerType === "courier";
  const isAuthorized = additionalData?.isAuthorized === true;

  // Yetkili kişi için özel email template
  if (isAuthorized) {
    const roleDisplayNames: { [key: string]: string } = {
      "manager": "Mağaza Müdürü",
      "assistant_manager": "Müdür Yardımcısı",
      "cashier": "Kasiyer",
      "sales_assistant": "Satış Görevlisi",
      "warehouse_staff": "Depo Görevlisi",
      "accountant": "Muhasebeci",
      "other": "Diğer"
    };

    const roleName = roleDisplayNames[additionalData.role] || additionalData.role || "Yetkili Personel";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Yummine Mağaza Yetkilendirmesi - ${additionalData.storeName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: #fff; padding: 20px; border: 2px solid #059669; border-radius: 8px; margin: 20px 0; }
          .role-badge { background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Mağaza Yetkilendirmesi</h1>
            <p>${additionalData.storeName} mağazasına hoş geldiniz</p>
          </div>

          <div class="content">
            <h2>Merhaba${additionalData?.firstName && additionalData?.lastName ? ` ${additionalData.firstName} ${additionalData.lastName}` : ''}!</h2>
            <p><strong>${additionalData.storeName}</strong> mağazası tarafından <span class="role-badge">${roleName}</span> rolü ile yetkilendirildiniz.</p>

            <div class="credentials">
              <h3>🔐 Giriş Bilgileriniz</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Şifre:</strong> ${additionalData?.generatedPassword || "tempPassword123!"}</p>
              <p><strong>Rolünüz:</strong> ${roleName}</p>
              <p style="color: #059669; font-weight: bold;">✅ Bu şifre otomatik olarak oluşturulmuştur.</p>
            </div>

            <h3>📋 Yetkileriniz</h3>
            <p>Rolünüze göre aşağıdaki işlemleri gerçekleştirebilirsiniz:</p>
            <ul>
              ${additionalData.role === "manager" ? `
                <li>Mağaza genel yönetimi</li>
                <li>Personel yönetimi</li>
                <li>Satış raporları</li>
                <li>Stok yönetimi</li>
              ` : additionalData.role === "cashier" ? `
                <li>Satış işlemleri</li>
                <li>Ödeme işlemleri</li>
                <li>Günlük raporlar</li>
              ` : additionalData.role === "sales_assistant" ? `
                <li>Satış desteği</li>
                <li>Müşteri hizmetleri</li>
                <li>Ürün tanıtımı</li>
              ` : `
                <li>Rolünüze özel işlemler</li>
              `}
            </ul>

            <div class="warning">
              <h4>⚠️ Önemli Bilgilendirme</h4>
              <ul>
                <li>Bu email adresiniz aynı zamanda hesabınızın kullanıcı adıdır.</li>
                <li>Güvenliğiniz için lütfen geçici şifrenizi hemen değiştirin.</li>
                <li>Şifrenizi unutmanız durumunda "Şifremi Unuttum" özelliğini kullanabilirsiniz.</li>
                <li>Mağaza sahibi tarafından yetkilendirildiğiniz için rolünüze uygun işlemleri gerçekleştirebilirsiniz.</li>
              </ul>
            </div>

            <h3>🚀 Sonraki Adımlar</h3>
            <ol>
              <li>Yummine uygulamasına giriş yapın</li>
              <li>Profil bilgilerinizi tamamlayın</li>
              <li>Şifrenizi değiştirin</li>
              <li>Görevlerinizi yerine getirmeye başlayın!</li>
            </ol>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://yummine.com"}/auth/login?type=partner"
                 style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Hemen Giriş Yap
              </a>
            </p>

            <p>Herhangi bir sorunuz olursa, mağaza sahibi ile iletişime geçebilirsiniz.</p>

            <div class="footer">
              <p>Bu email Yummine tarafından gönderilmiştir.<br>
              © ${new Date().getFullYear()} Yummine. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Normal kayıt email template'i
  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Yummine Partner Kaydı Başarılı</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: #fff; padding: 20px; border: 2px solid #10b981; border-radius: 8px; margin: 20px 0; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Yummine'e Hoş Geldiniz!</h1>
          <p>Partner kaydınız başarıyla tamamlandı</p>
        </div>

        <div class="content">
          <h2>Merhaba${additionalData?.firstName && additionalData?.lastName ? ` ${additionalData.firstName} ${additionalData.lastName}` : ''}!</h2>
          <p>Yummine ailesine katıldığınız için teşekkür ederiz. Kaydınız başarıyla tamamlandı ve artık platformumuzu kullanmaya başlayabilirsiniz.</p>

          <div class="credentials">
            <h3>🔐 Giriş Bilgileriniz</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Şifre:</strong> ${additionalData?.generatedPassword || "tempPassword123!"}</p>
            ${additionalData?.branchReferenceCode ? `<p><strong>Şube Referans Kodu:</strong> ${additionalData.branchReferenceCode}</p>` : ""}
            ${additionalData?.generatedPassword ? "<p style=\"color: #059669; font-weight: bold;\">✅ Bu şifre otomatik olarak oluşturulmuştur.</p>" : "<p style=\"color: #dc2626; font-weight: bold;\">⚠️ Lütfen ilk girişinizde şifrenizi değiştirin!</p>"}
          </div>

          <div class="warning">
            <h4>⚠️ Önemli Bilgilendirme</h4>
            <ul>
              <li>Bu email adresiniz aynı zamanda hesabınızın kullanıcı adıdır.</li>
              <li>Güvenliğiniz için lütfen geçici şifrenizi hemen değiştirin.</li>
              <li>Şifrenizi unutmanız durumunda "Şifremi Unuttum" özelliğini kullanabilirsiniz.</li>
            </ul>
          </div>
  `;

  if (isStore && additionalData?.storeName) {
    content += `
          <h3>🏪 Mağaza Bilgileriniz</h3>
          <p><strong>Mağaza Adı:</strong> ${additionalData.storeName}</p>
          ${additionalData.cariId ? `<p><strong>Cari ID:</strong> ${additionalData.cariId}</p>` : ""}
          ${additionalData.phone ? `<p><strong>Telefon:</strong> ${additionalData.phone}</p>` : ""}
          ${additionalData.branchCount ? `<p><strong>Toplam Şube Sayısı:</strong> ${additionalData.branchCount}</p>` : ""}
          ${additionalData.iban ? `<p><strong>IBAN:</strong> ${additionalData.iban}</p>` : ""}
          <p>Yakında mağaza profilinizi düzenleyebilir ve ürünlerinizi ekleyebilirsiniz.</p>

          ${additionalData.branchReferenceCode ? `
          <div style="background: #e0f2fe; border: 1px solid #0284c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4>🏢 Şube Yönetim Sistemi</h4>
            <p><strong>Şube Referans Kodunuz:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px;">${additionalData.branchReferenceCode}</code></p>
            <p>Bu kod ile alt şubelerinizin ana panele bağlanmasını sağlayabilirsiniz. Alt şubeler bu kodu kullanarak izin talebi gönderebilir ve siz onayladığınızda tek bir panelden tüm şubelerinizi yönetebilirsiniz.</p>
          </div>
          ` : ""}
    `;
  }

  if (isCourier && additionalData?.firstName && additionalData?.lastName) {
    content += `
          <h3>🚴 Kurye Bilgileriniz</h3>
          <p><strong>Ad Soyad:</strong> ${additionalData.firstName} ${additionalData.lastName}</p>
          ${additionalData.phone ? `<p><strong>Telefon:</strong> ${additionalData.phone}</p>` : ""}
          <p>Yakında teslimat görevlerini almaya başlayabilirsiniz.</p>
    `;
  }

  content += `
          <h3>🚀 Sonraki Adımlar</h3>
          <ol>
            <li>Yummine uygulamasına giriş yapın</li>
            <li>Profil bilgilerinizi tamamlayın</li>
            <li>Şifrenizi değiştirin</li>
             <li>Ürünlerinizi Girin!</li>
            <li>Hizmet vermeye başlayın!</li>
          </ol>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://yummine.com"}/auth/login?type=partner"
               style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Hemen Giriş Yap
            </a>
          </p>

          <p>Herhangi bir sorunuz olursa, destek ekibimizle iletişime geçebilirsiniz.</p>

          <div class="footer">
            <p>Bu email Yummine tarafından gönderilmiştir.<br>
            © ${new Date().getFullYear()} Yummine. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return content;
}

function generatePlainTextEmail(email: string, additionalData?: any): string {
  const isStore = additionalData?.partnerType === "store";
  const isCourier = additionalData?.partnerType === "courier";
  const isAuthorized = additionalData?.isAuthorized === true;

  let content = `Yummine Platform - Partner Kayıt Bilgileri

Merhaba${additionalData?.firstName && additionalData?.lastName ? ` ${additionalData.firstName} ${additionalData.lastName}` : ''}!

Yummine ailesine katıldığınız için teşekkür ederiz. Kaydınız başarıyla tamamlandı ve artık platformumuzu kullanmaya başlayabilirsiniz.

GİRİŞ BİLGİLERİNİZ
Email: ${email}
Şifre: ${additionalData?.generatedPassword || "tempPassword123!"}

Bu şifre otomatik olarak oluşturulmuştur.

ÖNEMLİ BİLGİLENDİRME
- Bu email adresiniz aynı zamanda hesabınızın kullanıcı adıdır.
- Güvenliğiniz için lütfen geçici şifrenizi hemen değiştirin.
- Şifrenizi unutmanız durumunda "Şifremi Unuttum" özelliğini kullanabilirsiniz.

${isStore && additionalData?.storeName ? `
MAĞAZA BİLGİLERİNİZ
Mağaza Adı: ${additionalData.storeName}
${additionalData.cariId ? `Cari ID: ${additionalData.cariId}` : ""}
${additionalData.phone ? `Telefon: ${additionalData.phone}` : ""}
${additionalData.branchCount ? `Toplam Şube Sayısı: ${additionalData.branchCount}` : ""}
${additionalData.iban ? `IBAN: ${additionalData.iban}` : ""}
` : ""}${isCourier && additionalData?.firstName && additionalData?.lastName ? `
KURYE BİLGİLERİNİZ
Ad Soyad: ${additionalData.firstName} ${additionalData.lastName}
${additionalData.phone ? `Telefon: ${additionalData.phone}` : ""}
` : ""}

SONRAKİ ADIMLAR
1. Yummine uygulamasına giriş yapın
2. Profil bilgilerinizi tamamlayın
3. Şifrenizi değiştirin
4. Hizmet vermeye başlayın!

Hemen Giriş Yap: ${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/auth/login?type=partner

Herhangi bir sorunuz olursa, destek ekibimizle iletişime geçebilirsiniz.

Bu email Yummine tarafından gönderilmiştir.
© ${new Date().getFullYear()} Yummine. Tüm hakları saklıdır.
`;

  return content;
}
import React from 'react';

interface ConfirmationProps {
  storeInfo: {
    storeName: string;
    corporateType: string;
    companyName: string;
    taxId: string;
    branchCount: number;
    isMainBranch: boolean;
    branchReferenceCode: string;
    hasBranches: boolean;
  };
  authorizedPersons: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
  personEmail: string;
  generateRandomPassword: () => string;
  sendPasswordEmail: (params: { to: string; password: string; additionalData?: any }) => Promise<void>;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  storeInfo,
  authorizedPersons,
  personEmail,
  generateRandomPassword,
  sendPasswordEmail,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Kayıt Onayı</h3>
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-300 mb-4">Kayıt işleminiz tamamlanmak üzere. Aşağıdaki bilgileri kontrol edin:</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Mağaza Adı:</span>
            <span className="text-white">{storeInfo.storeName}</span>
          </div>
          {storeInfo.corporateType !== "PRIVATE" && (
            <div className="flex justify-between">
              <span className="text-gray-400">Şirket Türü:</span>
              <span className="text-white">{storeInfo.corporateType}</span>
            </div>
          )}
          {storeInfo.corporateType !== "PRIVATE" && storeInfo.companyName && (
            <div className="flex justify-between">
              <span className="text-gray-400">Şirket Adı:</span>
              <span className="text-white">{storeInfo.companyName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">{storeInfo.corporateType === "PRIVATE" ? "TC Kimlik Numarası:" : "VKN/TCKN:"}</span>
            <span className="text-white">{storeInfo.taxId}</span>
          </div>
          {storeInfo.hasBranches && (
            <div className="flex justify-between">
              <span className="text-gray-400">Şube Sayısı:</span>
              <span className="text-white">{storeInfo.branchCount}</span>
            </div>
          )}
          {storeInfo.hasBranches && (
            <div className="flex justify-between">
              <span className="text-gray-400">Bu Oluşturulan Hesap Şube Türü:</span>
              <span className="text-white">{storeInfo.isMainBranch ? "Bu Ana Şube" : "Bu Alt Şube"}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Cari ID:</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                className="px-2 py-1 rounded bg-gray-700 text-white text-sm"
                value={storeInfo.branchReferenceCode}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(storeInfo.branchReferenceCode)}
                className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Kopyala
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Yetkili Kişi Sayısı:</span>
            <span className="text-white">{authorizedPersons.length}</span>
          </div>
          {authorizedPersons.map((person, index) => (
            <div key={index} className="mt-2 p-2 bg-gray-700 rounded">
              <div className="text-sm text-gray-400">Yetkili Kişi {index + 1}:</div>
              <div className="text-white">{person.firstName} {person.lastName} - {person.email} ({person.role})</div>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={async () => {
          const testPassword = generateRandomPassword();
          try {
            await sendPasswordEmail({ to: personEmail, password: testPassword });
            alert('Test şifresi gönderildi: ' + testPassword);
          } catch (err) {
            alert('Şifre gönderilemedi');
          }
        }}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Test: Şifre Gönder
      </button>
    </div>
  );
};

export default Confirmation;
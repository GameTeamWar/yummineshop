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
    branchPassword?: string;
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
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-700 mb-4">Kayıt işleminiz tamamlanmak üzere. Aşağıdaki bilgileri kontrol edin:</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Mağaza Adı:</span>
            <span className="text-gray-900">{storeInfo.storeName}</span>
          </div>
          {storeInfo.corporateType !== "PRIVATE" && (
            <div className="flex justify-between">
              <span className="text-gray-600">Şirket Türü:</span>
              <span className="text-gray-900">{storeInfo.corporateType}</span>
            </div>
          )}
          {storeInfo.corporateType !== "PRIVATE" && storeInfo.companyName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Şirket Adı:</span>
              <span className="text-gray-900">{storeInfo.companyName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">{storeInfo.corporateType === "PRIVATE" ? "TC Kimlik Numarası:" : "VKN/TCKN:"}</span>
            <span className="text-gray-900">{storeInfo.taxId}</span>
          </div>
          {storeInfo.hasBranches && (
            <div className="flex justify-between">
              <span className="text-gray-600">Şube Sayısı:</span>
              <span className="text-gray-900">{storeInfo.branchCount}</span>
            </div>
          )}
          {storeInfo.hasBranches && storeInfo.isMainBranch && storeInfo.branchPassword && (
            <div className="flex justify-between">
              <span className="text-gray-600">Şube Ekleme Şifresi:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  className="px-2 py-1 rounded bg-gray-200 text-gray-900 text-sm"
                  value={storeInfo.branchPassword}
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(storeInfo.branchPassword || '')}
                  className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Kopyala
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Cari ID:</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                className="px-2 py-1 rounded bg-gray-200 text-gray-900 text-sm"
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
            <span className="text-gray-600">Yetkili Kişi Sayısı:</span>
            <span className="text-gray-900">{authorizedPersons.length}</span>
          </div>
          {authorizedPersons.map((person, index) => (
            <div key={index} className="mt-2 p-2 bg-gray-100 rounded">
              <div className="text-sm text-gray-600">Yetkili Kişi {index + 1}:</div>
              <div className="text-gray-900">{person.firstName} {person.lastName} - {person.email} ({person.role})</div>
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
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
      >
        Test: Şifre Gönder
      </button>
      {storeInfo.hasBranches && storeInfo.isMainBranch && storeInfo.branchPassword && (
        <button
          type="button"
          onClick={async () => {
            try {
              await sendPasswordEmail({ 
                to: personEmail, 
                password: storeInfo.branchPassword || '',
                additionalData: { type: 'branch_password' }
              });
              alert('Şube şifresi gönderildi: ' + storeInfo.branchPassword);
            } catch (err) {
              alert('Şube şifresi gönderilemedi');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Şube Şifresini Gönder
        </button>
      )}
    </div>
  );
};

export default Confirmation;
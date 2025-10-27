import React, { useEffect, useState } from 'react';

interface Person {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  iban: string;
  birthDate: string;
  kepAddress: string;
  showBranchPassword?: boolean;
}

interface PersonInfoProps {
  person: Person;
  setPerson: React.Dispatch<React.SetStateAction<Person>>;
  formErrors: { [key: string]: string };
  isCourier: boolean;
  checkEmailExists: (email: string, isAuthorizedPerson?: boolean, personIndex?: number) => void;
  storeInfo?: {
    storeName: string;
    taxId: string;
    companyName: string;
    storeType: string;
    branchCount: number;
    isMainBranch: boolean;
    branchReferenceCode: string;
    corporateType: string;
    hasBranches: boolean;
    hasAuthorizedPersons: boolean;
    logo: File | null;
    branchPassword?: string;
  };
  setStoreInfo?: React.Dispatch<React.SetStateAction<any>>;
  generateBranchReferenceCode?: () => string;
  generateRandomPassword?: () => string;
}

const PersonInfo: React.FC<PersonInfoProps> = ({
  person,
  setPerson,
  formErrors,
  isCourier,
  checkEmailExists,
  storeInfo,
  setStoreInfo,
  generateBranchReferenceCode,
  generateRandomPassword,
}) => {
  const [emailTimeout, setEmailTimeout] = useState<number | null>(null);

  const handleEmailChange = (value: string) => {
    setPerson(f => ({ ...f, email: value }));
    
    // Clear previous timeout
    if (emailTimeout) {
      clearTimeout(emailTimeout);
    }
    
    // Set new timeout for email validation (1 second delay)
    const timeout = setTimeout(() => {
      if (value && value.includes('@')) {
        checkEmailExists(value, false);
      }
    }, 1000);
    
    setEmailTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailTimeout) {
        clearTimeout(emailTimeout);
      }
    };
  }, [emailTimeout]);
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Kişi Bilgileri</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Ad *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            value={person?.firstName || ""}
            onChange={e => setPerson(f => ({ ...f, firstName: e.target.value }))}
            required
          />
          {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Soyad *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            value={person?.lastName || ""}
            onChange={e => setPerson(f => ({ ...f, lastName: e.target.value }))}
            required
          />
          {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefon *</label>
          <input
            type="tel"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            value={person?.phone || ""}
            onChange={e => setPerson(f => ({ ...f, phone: e.target.value }))}
            required
          />
          {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-posta *</label>
          <input
            type="email"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            value={person?.email || ""}
            onChange={e => handleEmailChange(e.target.value)}
            onBlur={e => {
              if (e.target.value && e.target.value.includes('@')) {
                checkEmailExists(e.target.value, false);
              }
            }}
            required
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            IBAN {!isCourier && '*'}
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.iban ? 'border-red-500' : 'border-gray-300'
            }`}
            value={person?.iban || ""}
            onChange={e => setPerson(f => ({ ...f, iban: e.target.value }))}
            required={!isCourier}
          />
          {formErrors.iban && <p className="text-red-500 text-xs mt-1">{formErrors.iban}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Doğum Tarihi {!isCourier && '*'}
          </label>
          <input
            type="date"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.birthDate ? 'border-red-500' : 'border-gray-300'
            }`}
            value={person?.birthDate || ""}
            onChange={e => setPerson(f => ({ ...f, birthDate: e.target.value }))}
            required={!isCourier}
          />
          {formErrors.birthDate && <p className="text-red-500 text-xs mt-1">{formErrors.birthDate}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">KEP Adresi</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={person?.kepAddress || ""}
            onChange={e => setPerson(f => ({ ...f, kepAddress: e.target.value }))}
          />
        </div>

        {!isCourier && storeInfo && setStoreInfo && storeInfo.hasBranches && (
          <div>
            <label className="block text-sm font-medium mb-1">Şube Sayısı *</label>
            <input
              type="number"
              min="2"
              className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.branchCount ? 'border-red-500' : 'border-gray-300'
              }`}
              value={storeInfo.branchCount || 2}
              onChange={e => setStoreInfo((f: any) => ({ ...f, branchCount: parseInt(e.target.value) || 2 }))}
              required
            />
            {formErrors.branchCount && <p className="text-red-500 text-xs mt-1">{formErrors.branchCount}</p>}
          </div>
        )}
        {!isCourier && storeInfo && setStoreInfo && storeInfo.hasBranches && (
          <div>
            <label className="block text-sm font-medium mb-1">Şube Türü *</label>
            <select
              className="w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={storeInfo.isMainBranch ? "main" : "branch"}
              onChange={e => {
                const isMain = e.target.value === "main";
                setStoreInfo((f: any) => ({
                  ...f,
                  isMainBranch: isMain
                }));
              }}
              required
            >
              <option value="main">Bu Ana Şube</option>
              <option value="branch">Bu Alt Şube</option>
            </select>
          </div>
        )}
        {!isCourier && storeInfo && setStoreInfo && storeInfo.hasBranches && storeInfo.isMainBranch && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Şube Ekleme Şifresi *</label>
            <div className="relative">
              <input
                type={person.showBranchPassword ? "text" : "password"}
                className={`w-full px-3 py-2 pr-12 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.branchPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                value={storeInfo.branchPassword || ""}
                onChange={e => setStoreInfo((f: any) => ({ ...f, branchPassword: e.target.value }))}
                placeholder="Güçlü bir şifre belirleyin"
                required
              />
              <button
                type="button"
                onClick={() => setPerson(p => ({ ...p, showBranchPassword: !p.showBranchPassword }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {person.showBranchPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.branchPassword && <p className="text-red-500 text-xs mt-1">{formErrors.branchPassword}</p>}
            <div className="mt-2 text-xs text-gray-500">
              <p>• En az 8 karakter uzunluğunda olmalı</p>
              <p>• Büyük/küçük harf, rakam ve özel karakter içermeli</p>
              <p>• Bu şifre yeni şube eklemek için kullanılacak</p>
            </div>
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Ana Şube Bilgilendirmesi</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Bu hesap <strong>ana şube</strong> olarak kaydedilecektir</li>
                    <li>• Yukarıda belirlediğiniz şifre ile sisteme yeni şubeler ekleyebilirsiniz</li>
                    <li>• Şifreyi güvenli bir yerde saklayınız, şube ekleme işlemi için gereklidir</li>
                    <li>• Bu şifre ayrıca kayıt e-posta adresinize gönderilecektir</li>
                    <li>• Şifre kaybı durumunda müşteri hizmetleri ile iletişime geçiniz</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {!isCourier && storeInfo && setStoreInfo && (
          <div className="flex flex-col space-y-4 items-start sm:col-span-2">
            <div className="flex items-center space-x-3">
              <label className="group flex items-center cursor-pointer">
                <input
                  className="hidden peer"
                  type="checkbox"
                  checked={storeInfo.hasBranches}
                  onChange={e => setStoreInfo((f: any) => ({ ...f, hasBranches: e.target.checked, branchCount: e.target.checked ? (f.branchCount < 2 ? 2 : f.branchCount) : 1 }))}
                />

                <span
                  className="relative w-8 h-8 flex justify-center items-center bg-gray-50 border-2 border-gray-300 rounded-md shadow-md transition-all duration-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-hover:scale-105"
                >
                  <span
                    className="absolute inset-0 bg-linear-to-br from-white/30 to-white/10 opacity-0 peer-checked:opacity-100 rounded-md transition-all duration-500 peer-checked:animate-pulse"
                  ></span>

                  <svg
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    className="hidden w-5 h-5 text-white peer-checked:block transition-transform duration-500 transform scale-50 peer-checked:scale-100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </span>

                <span
                  className="ml-3 text-gray-300 group-hover:text-blue-400 font-medium transition-colors duration-300"
                >
                  Şubeleriniz var mı?
                </span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <label className="group flex items-center cursor-pointer">
                <input
                  className="hidden peer"
                  type="checkbox"
                  checked={storeInfo.hasAuthorizedPersons}
                  onChange={e => setStoreInfo((f: any) => ({ ...f, hasAuthorizedPersons: e.target.checked }))}
                />

                <span
                  className="relative w-8 h-8 flex justify-center items-center bg-gray-50 border-2 border-gray-300 rounded-md shadow-md transition-all duration-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-hover:scale-105"
                >
                  <span
                    className="absolute inset-0 bg-linear-to-br from-white/30 to-white/10 opacity-0 peer-checked:opacity-100 rounded-md transition-all duration-500 peer-checked:animate-pulse"
                  ></span>

                  <svg
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    className="hidden w-5 h-5 text-white peer-checked:block transition-transform duration-500 transform scale-50 peer-checked:scale-100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </span>

                <span
                  className="ml-3 text-gray-300 group-hover:text-blue-400 font-medium transition-colors duration-300"
                >
                  Yetkili kişileriniz var mı?
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonInfo;
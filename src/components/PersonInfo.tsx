import React, { useEffect, useState } from 'react';

interface Person {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  iban: string;
  birthDate: string;
  kepAddress: string;
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
  };
  setStoreInfo?: React.Dispatch<React.SetStateAction<any>>;
  generateBranchReferenceCode?: () => string;
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
            className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.firstName ? 'border-red-500' : 'border-gray-700'
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
            className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.lastName ? 'border-red-500' : 'border-gray-700'
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
            className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.phone ? 'border-red-500' : 'border-gray-700'
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
            className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.email ? 'border-red-500' : 'border-gray-700'
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
            className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.iban ? 'border-red-500' : 'border-gray-700'
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
            className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.birthDate ? 'border-red-500' : 'border-gray-700'
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
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.branchCount ? 'border-red-500' : 'border-gray-700'
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
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={storeInfo.isMainBranch ? "main" : "branch"}
              onChange={e => setStoreInfo((f: any) => ({ ...f, isMainBranch: e.target.value === "main" }))}
              required
            >
              <option value="main">Bu Ana Şube</option>
              <option value="branch">Bu Alt Şube</option>
            </select>
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
                  onChange={e => setStoreInfo((f: any) => ({ ...f, hasBranches: e.target.checked, branchCount: e.target.checked ? f.branchCount : 1 }))}
                />

                <span
                  className="relative w-8 h-8 flex justify-center items-center bg-gray-800 border-2 border-gray-600 rounded-md shadow-md transition-all duration-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-hover:scale-105"
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
                  className="relative w-8 h-8 flex justify-center items-center bg-gray-800 border-2 border-gray-600 rounded-md shadow-md transition-all duration-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-hover:scale-105"
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
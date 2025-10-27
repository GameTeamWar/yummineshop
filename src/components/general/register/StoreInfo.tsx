import React from 'react';
interface StoreInfoType {
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
}

interface StoreInfoProps {
  storeInfo: StoreInfoType;
  setStoreInfo: React.Dispatch<React.SetStateAction<StoreInfoType>>;
  formErrors: { [key: string]: string };
  logoPreview: string | null;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  generateBranchReferenceCode: () => string;
}

const StoreInfo: React.FC<StoreInfoProps> = ({
  storeInfo,
  setStoreInfo,
  formErrors,
  logoPreview,
  setLogoPreview,
  generateBranchReferenceCode,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Mağaza Bilgileri</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Mağaza Adı *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.storeName ? 'border-red-500' : 'border-gray-300'
            }`}
            value={storeInfo?.storeName || ""}
            onChange={e => setStoreInfo(f => ({ ...f, storeName: e.target.value }))}
            required
          />
          {formErrors.storeName && <p className="text-red-500 text-xs mt-1">{formErrors.storeName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şirket Türü *</label>
          <select
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.corporateType ? 'border-red-500' : 'border-gray-300'
            }`}
            value={storeInfo.corporateType || ""}
            onChange={e => {
              const value = e.target.value;
              setStoreInfo(f => ({
                ...f,
                corporateType: value,
                branchReferenceCode: value && !f.branchReferenceCode ? generateBranchReferenceCode() : f.branchReferenceCode
              }));
            }}
            required
          >
            <option value="" disabled>Seçim yapınız</option>
            <option value="PRIVATE">Şahıs</option>
            <option value="UNINCORPORATED">Adi Ortaklık</option>
            <option value="UNLIMITED_COMPANY">Kollektif Şirket</option>
            <option value="UNINCORPORATED_COMMANDITE">Adi Komandit Şirket</option>
            <option value="ESH_COMMANDITE">Sermayesi Paylara Bölünmüş Komandit Şirket</option>
            <option value="LIMITED">Limited Şirketi</option>
            <option value="ANONYMOUS">Anonim Şirket</option>
            <option value="COOPERATIVE">Kooperatif Şirket</option>
            <option value="OTHER">Diğer</option>
            <option value="BUSINESS_PARTNERSHIP">İş Ortaklığı</option>
            <option value="ASSOCIATION">Dernek İşletmesi</option>
            <option value="FOUNDATION">Vakıf İşletmesi</option>
          </select>
          {formErrors.corporateType && <p className="text-red-500 text-xs mt-1">{formErrors.corporateType}</p>}
        </div>
        {storeInfo.corporateType && storeInfo.corporateType !== "PRIVATE" && (
          <div>
            <label className="block text-sm font-medium mb-1">Şirket Adı *</label>
            <input
              type="text"
              className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              value={storeInfo.companyName || ""}
              onChange={e => setStoreInfo(f => ({ ...f, companyName: e.target.value }))}
              required
            />
            {formErrors.companyName && <p className="text-red-500 text-xs mt-1">{formErrors.companyName}</p>}
          </div>
        )}
        {storeInfo.corporateType && (
          <div>
            <label className="block text-sm font-medium mb-1">
              {storeInfo.corporateType === "PRIVATE" ? "TC Kimlik Numarası *" : "Vergi Kimlik Numarası *"}
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.taxId ? 'border-red-500' : 'border-gray-300'
              }`}
              value={storeInfo.taxId || ""}
              onChange={e => setStoreInfo(f => ({ ...f, taxId: e.target.value }))}
              required
            />
            {formErrors.taxId && <p className="text-red-500 text-xs mt-1">{formErrors.taxId}</p>}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Mağaza Tipi *</label>
          <select
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.storeType ? 'border-red-500' : 'border-gray-300'
            }`}
            value={storeInfo.storeType || ""}
            onChange={e => setStoreInfo(f => ({ ...f, storeType: e.target.value }))}
            required
          >
            <option value="" disabled>Seçin...</option>
            <option value="kozmetik">Kozmetik</option>
            <option value="tekstil">Tekstil</option>
            <option value="elektronik">Elektronik</option>
            <option value="gida">Gıda</option>
            <option value="market">Market</option>
            <option value="diger">Diğer</option>
          </select>
          {formErrors.storeType && <p className="text-red-500 text-xs mt-1">{formErrors.storeType}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Mağaza Logosu</label>
          <input
            type="file"
            accept="image/*"
            className="w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => {
              const file = e.target.files?.[0] || null;
              setStoreInfo(f => ({ ...f, logo: file }));
              if (file) {
                const previewUrl = URL.createObjectURL(file);
                setLogoPreview(previewUrl);
              } else {
                setLogoPreview(null);
              }
            }}
          />
          {storeInfo.logo ? (
            <p className="text-green-400 text-xs mt-1">Seçilen dosya: {storeInfo.logo.name}</p>
          ) : (
            <p className="text-gray-400 text-xs mt-1">Dosya seçilmedi</p>
          )}
          {logoPreview && (
            <div className="mt-3">
              <p className="text-sm text-gray-400 mb-2">Logo Önizlemesi:</p>
              <img
                src={logoPreview}
                alt="Mağaza Logo Önizlemesi"
                className="max-w-32 max-h-32 object-contain border border-gray-300 rounded-lg bg-gray-50 p-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;



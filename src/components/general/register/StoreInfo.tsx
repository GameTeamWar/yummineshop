import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
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
  categories?: string[];
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
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Kategorileri Firebase'den gerçek zamanlı çek
  useEffect(() => {
    setLoadingCategories(true);
    const categoriesRef = collection(db, 'categories');
    
    const unsubscribe = onSnapshot(categoriesRef, (querySnapshot) => {
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      setLoadingCategories(false);
    }, (error) => {
      console.error('Kategoriler çekilirken hata:', error);
      setLoadingCategories(false);
    });

    return () => unsubscribe();
  }, []);
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
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Mağaza Kategorileri * (En fazla 3 adet)</label>
          <div className="space-y-3">
            {loadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-500">Kategoriler yükleniyor...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto relative">
                {categories
                  .filter(category => category.isActive !== false)
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                  .map((category) => {
                    const isSelected = storeInfo.categories?.includes(category.id) || false;
                    const isDisabled = !isSelected && (storeInfo.categories?.length || 0) >= 3;

                    return (
                      <label
                        key={category.id}
                        className={`relative group cursor-pointer transition-all duration-200 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : isDisabled
                              ? 'border-gray-200 bg-gray-50'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                        onMouseEnter={() => {
                          if (!category.courierCompatible) {
                            toast.warning(`🚚 ${category.name} kategorisinde kurye teslimatı yoktur, tarafınızdan teslimat gerçekleşir!`, {
                              position: "top-center",
                              autoClose: 10000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: false,
                              toastId: `courier-info-${category.id}`
                            });
                          }
                        }}
                        onMouseLeave={() => {
                          // Toast otomatik kapanacak, manuel dismiss yapma
                        }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`relative flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500'
                                : isDisabled
                                  ? 'border-gray-300'
                                  : 'border-gray-300 group-hover:border-blue-400'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium transition-colors duration-200 ${
                                isSelected ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {category.name}
                              </div>
                            </div>
                          </div>

                          {/* Info icon for courier incompatible categories */}
                          {!category.courierCompatible && (
                            <div className="absolute top-2 right-2">
                              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}

                          {/* Hover effect */}
                          {!isDisabled && !isSelected && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                          )}

                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => {
                            const categoryId = category.id;
                            setStoreInfo(prev => {
                              const currentCategories = prev.categories || [];
                              if (e.target.checked) {
                                if (currentCategories.length >= 3) return prev;
                                return { ...prev, categories: [...currentCategories, categoryId] };
                              } else {
                                return { ...prev, categories: currentCategories.filter(id => id !== categoryId) };
                              }
                            });
                          }}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
              </div>
            )}

            {/* Selection counter */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Seçilen kategoriler:</span>
                <span className={`font-medium ${storeInfo.categories?.length === 3 ? 'text-orange-600' : 'text-blue-600'}`}>
                  {storeInfo.categories?.length || 0} / 3
                </span>
              </div>
              {storeInfo.categories?.length === 3 && (
                <span className="text-orange-600 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Maksimum limit ulaştı
                </span>
              )}
            </div>

            {formErrors.categories && <p className="text-red-500 text-xs mt-1">{formErrors.categories}</p>}
          </div>
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



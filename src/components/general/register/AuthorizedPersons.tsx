import React, { useEffect, useState } from 'react';

interface AuthorizedPerson {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: string;
  idCard: File | null;
}

interface AuthorizedPersonsProps {
  authorizedPersons: AuthorizedPerson[];
  setAuthorizedPersons: React.Dispatch<React.SetStateAction<AuthorizedPerson[]>>;
  formErrors: { [key: string]: string };
  checkEmailExists: (email: string, isAuthorizedPerson?: boolean, personIndex?: number) => void;
}

const AuthorizedPersons: React.FC<AuthorizedPersonsProps> = ({
  authorizedPersons,
  setAuthorizedPersons,
  formErrors,
  checkEmailExists,
}) => {
  const [emailTimeouts, setEmailTimeouts] = useState<{[key: number]: number | null}>({});

  const handleEmailChange = (index: number, value: string) => {
    const newPersons = [...authorizedPersons];
    newPersons[index].email = value;
    setAuthorizedPersons(newPersons);
    
    // Clear previous timeout for this person
    if (emailTimeouts[index]) {
      clearTimeout(emailTimeouts[index]!);
    }
    
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      // Geçersiz email formatı için hata göster
      return;
    }
    
    // Set new timeout for email validation (1 second delay)
    const timeout = setTimeout(() => {
      if (value && value.includes('@')) {
        checkEmailExists(value, true, index);
      }
    }, 1000);
    
    setEmailTimeouts(prev => ({ ...prev, [index]: timeout }));
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(emailTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [emailTimeouts]);
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Yetkili Kişiler</h3>
      <p className="text-sm text-gray-700 mb-4">Mağazanızda çalışan yetkili kişileri ekleyin. Her kişiye rolüne göre yetkilendirme maili gönderilecektir.<span className="text-red-400 font-bold"> Panel içi yetkilendirme sağlayacaksınız ve paneli yönetme yetkisine sahip olacaklardır.paneliniz üzerinde yetkilendirme (rol atama) ayarlarını yapabilirsiniz.Daha Sonrada yetkilendirme işlemlerini gerçekleştirebilirsiniz.</span></p>
      {authorizedPersons.map((person, index) => (
        <div key={index} className="bg-gray-100 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2 text-gray-600">Yetkili Kişi {index + 1}</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad *</label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors[`authFirstName_${index}`] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={person.firstName || ""}
                onChange={e => {
                  const newPersons = [...authorizedPersons];
                  newPersons[index].firstName = e.target.value;
                  setAuthorizedPersons(newPersons);
                }}
                required
              />
              {formErrors[`authFirstName_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`authFirstName_${index}`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Soyad *</label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors[`authLastName_${index}`] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={person.lastName || ""}
                onChange={e => {
                  const newPersons = [...authorizedPersons];
                  newPersons[index].lastName = e.target.value;
                  setAuthorizedPersons(newPersons);
                }}
                required
              />
              {formErrors[`authLastName_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`authLastName_${index}`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input
                type="tel"
                className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors[`authPhone_${index}`] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={person.phone || ""}
                onChange={e => {
                  const newPersons = [...authorizedPersons];
                  newPersons[index].phone = e.target.value;
                  setAuthorizedPersons(newPersons);
                }}
                required
              />
              {formErrors[`authPhone_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`authPhone_${index}`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta *</label>
              <input
                type="email"
                className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors[`authEmail_${index}`] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={person.email || ""}
                onChange={e => handleEmailChange(index, e.target.value)}
                onBlur={e => {
                  const value = e.target.value;
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (value && emailRegex.test(value)) {
                    checkEmailExists(value, true, index);
                  }
                }}
                required
              />
              {formErrors[`authEmail_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`authEmail_${index}`]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mağazadaki Rolü *</label>
              <select
                className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors[`authRole_${index}`] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={person.role || ""}
                onChange={e => {
                  const newPersons = [...authorizedPersons];
                  newPersons[index].role = e.target.value;
                  setAuthorizedPersons(newPersons);
                }}
                required
              >
                <option value="" disabled>Rol seçin...</option>
                <option value="manager">Mağaza Müdürü</option>
                <option value="assistant_manager">Müdür Yardımcısı</option>
                <option value="cashier">Kasiyer</option>
                <option value="sales_assistant">Satış Görevlisi</option>
                <option value="warehouse_staff">Depo Görevlisi</option>
                <option value="accountant">Muhasebeci</option>
                <option value="other">Diğer</option>
              </select>
              {formErrors[`authRole_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`authRole_${index}`]}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Kimlik Fotokopisi *</label>
              <input
                type="file"
                accept="image/*"
                className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors[`authIdCard_${index}`] ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={e => {
                  const newPersons = [...authorizedPersons];
                  newPersons[index].idCard = e.target.files?.[0] || null;
                  setAuthorizedPersons(newPersons);
                }}
                required
              />
              {person.idCard ? (
                <p className="text-green-400 text-xs mt-1">Seçilen dosya: {person.idCard.name}</p>
              ) : (
                <p className="text-gray-400 text-xs mt-1">Dosya seçilmedi</p>
              )}
              {formErrors[`authIdCard_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`authIdCard_${index}`]}</p>}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setAuthorizedPersons([...authorizedPersons, { firstName: "", lastName: "", phone: "", email: "", role: "", idCard: null }])}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        + Kişi Ekle
      </button>
    </div>
  );
};

export default AuthorizedPersons;
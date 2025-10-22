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
}

const PersonInfo: React.FC<PersonInfoProps> = ({
  person,
  setPerson,
  formErrors,
  isCourier,
  checkEmailExists,
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
      </div>
    </div>
  );
};

export default PersonInfo;
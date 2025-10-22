import React from 'react';

interface DocumentsType {
  idCard: File | null;
  driversLicense: File | null;
  taxCertificate: File | null;
}

interface DocumentsProps {
  documents: DocumentsType;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentsType>>;
  formErrors: { [key: string]: string };
  isCourier: boolean;
}

const Documents: React.FC<DocumentsProps> = ({
  documents,
  setDocuments,
  formErrors,
  isCourier,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Evrak Bilgileri</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Kimlik Fotoğrafı *</label>
          <input
            type="file"
            accept="image/*"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.idCard ? 'border-red-500' : 'border-gray-300'
            }`}
            onChange={e => setDocuments(f => ({ ...f, idCard: e.target.files?.[0] || null }))}
            required
          />
          {documents.idCard ? (
            <p className="text-green-400 text-xs mt-1">Seçilen dosya: {documents.idCard.name}</p>
          ) : (
            <p className="text-gray-400 text-xs mt-1">Dosya seçilmedi</p>
          )}
          {formErrors.idCard && <p className="text-red-500 text-xs mt-1">{formErrors.idCard}</p>}
        </div>
        {!isCourier && (
          <div>
            <label className="block text-sm font-medium mb-1">Vergi Levhası *</label>
            <input
              type="file"
              accept="image/*"
              className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.taxCertificate ? 'border-red-500' : 'border-gray-700'
              }`}
              onChange={e => setDocuments(f => ({ ...f, taxCertificate: e.target.files?.[0] || null }))}
              required
            />
            {documents.taxCertificate ? (
              <p className="text-green-400 text-xs mt-1">Seçilen dosya: {documents.taxCertificate.name}</p>
            ) : (
              <p className="text-gray-400 text-xs mt-1">Dosya seçilmedi</p>
            )}
            {formErrors.taxCertificate && <p className="text-red-500 text-xs mt-1">{formErrors.taxCertificate}</p>}
          </div>
        )}
        {isCourier && (
          <div>
            <label className="block text-sm font-medium mb-1">Ehliyet Fotoğrafı *</label>
            <input
              type="file"
              accept="image/*"
              className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.driversLicense ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={e => setDocuments(f => ({ ...f, driversLicense: e.target.files?.[0] || null }))}
              required
            />
            {documents.driversLicense ? (
              <p className="text-green-400 text-xs mt-1">Seçilen dosya: {documents.driversLicense.name}</p>
            ) : (
              <p className="text-gray-400 text-xs mt-1">Dosya seçilmedi</p>
            )}
            {formErrors.driversLicense && <p className="text-red-500 text-xs mt-1">{formErrors.driversLicense}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
import React, { useState } from 'react';
import PersonInfo from './PersonInfo';
import StoreInfo from './StoreInfo';
import AuthorizedPersons from './AuthorizedPersons';
import Documents from './Documents';
import AddressInfo from './AddressInfo';
import Confirmation from './Confirmation';

interface StoreRegistrationProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  person: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    iban: string;
    birthDate: string;
    kepAddress: string;
  };
  setPerson: React.Dispatch<React.SetStateAction<any>>;
  storeInfo: {
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
  };
  setStoreInfo: React.Dispatch<React.SetStateAction<any>>;
  logoPreview: string | null;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  authorizedPersons: Array<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    role: string;
    idCard: File | null;
  }>;
  setAuthorizedPersons: React.Dispatch<React.SetStateAction<any>>;
  documents: {
    idCard: File | null;
    driversLicense: File | null;
    taxCertificate: File | null;
  };
  setDocuments: React.Dispatch<React.SetStateAction<any>>;
  address: {
    province: string;
    district: string;
    neighborhood: string;
    street: string;
    detailedAddress: string;
    latitude: number;
    longitude: number;
  };
  setAddress: React.Dispatch<React.SetStateAction<any>>;
  formErrors: { [key: string]: string };
  checkEmailExists: (email: string, isAuthorizedPerson?: boolean, personIndex?: number) => void;
  cities: string[];
  loadingLocations: boolean;
  generateBranchReferenceCode: () => string;
  generateRandomPassword: () => string;
  sendPasswordEmail: (params: { to: string; password: string; additionalData?: any }) => Promise<void>;
}

const StoreRegistration: React.FC<StoreRegistrationProps> = ({
  step,
  setStep,
  person,
  setPerson,
  storeInfo,
  setStoreInfo,
  logoPreview,
  setLogoPreview,
  authorizedPersons,
  setAuthorizedPersons,
  documents,
  setDocuments,
  address,
  setAddress,
  formErrors,
  checkEmailExists,
  cities,
  loadingLocations,
  generateBranchReferenceCode,
  generateRandomPassword,
  sendPasswordEmail,
}) => {
  const steps = [
    { title: "Kişi Bilgileri" },
    { title: "Mağaza Bilgileri" },
    ...(storeInfo.hasAuthorizedPersons ? [{ title: "Yetkili Kişiler" }] : []),
    { title: "Evrak Bilgileri" },
    { title: "Adres Bilgileri" },
    { title: "Onay" },
  ];

  const renderStepContent = () => {
    switch (steps[step]?.title) {
      case "Kişi Bilgileri":
        return (
          <PersonInfo
            person={person}
            setPerson={setPerson}
            formErrors={formErrors}
            isCourier={false}
            checkEmailExists={checkEmailExists}
            storeInfo={storeInfo}
            setStoreInfo={setStoreInfo}
            generateBranchReferenceCode={generateBranchReferenceCode}
            generateRandomPassword={generateRandomPassword}
          />
        );
      case "Mağaza Bilgileri":
        return (
          <StoreInfo
            storeInfo={storeInfo}
            setStoreInfo={setStoreInfo}
            formErrors={formErrors}
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
            generateBranchReferenceCode={generateBranchReferenceCode}
          />
        );
      case "Yetkili Kişiler":
        return (
          <AuthorizedPersons
            authorizedPersons={authorizedPersons}
            setAuthorizedPersons={setAuthorizedPersons}
            formErrors={formErrors}
            checkEmailExists={checkEmailExists}
          />
        );
      case "Evrak Bilgileri":
        return (
          <Documents
            documents={documents}
            setDocuments={setDocuments}
            formErrors={formErrors}
            isCourier={false}
          />
        );
      case "Adres Bilgileri":
        return (
          <AddressInfo
            address={address}
            setAddress={setAddress}
            formErrors={formErrors}
            cities={cities}
            loadingLocations={loadingLocations}
          />
        );
      case "Onay":
        return (
          <Confirmation
            storeInfo={storeInfo}
            authorizedPersons={authorizedPersons}
            personEmail={person.email}
            generateRandomPassword={generateRandomPassword}
            sendPasswordEmail={sendPasswordEmail}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {renderStepContent()}
    </div>
  );
};

export default StoreRegistration;
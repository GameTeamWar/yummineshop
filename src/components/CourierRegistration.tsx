import React, { useState } from 'react';
import PersonInfo from './PersonInfo';
import Documents from './Documents';
import AddressInfo from './AddressInfo';

interface CourierRegistrationProps {
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
}

const CourierRegistration: React.FC<CourierRegistrationProps> = ({
  step,
  setStep,
  person,
  setPerson,
  documents,
  setDocuments,
  address,
  setAddress,
  formErrors,
  checkEmailExists,
  cities,
  loadingLocations,
}) => {
  const steps = [
    { title: "Kişi Bilgileri" },
    { title: "Evrak Bilgileri" },
    { title: "Adres Bilgileri" },
  ];

  const renderStepContent = () => {
    switch (steps[step]?.title) {
      case "Kişi Bilgileri":
        return (
          <PersonInfo
            person={person}
            setPerson={setPerson}
            formErrors={formErrors}
            isCourier={true}
            checkEmailExists={checkEmailExists}
          />
        );
      case "Evrak Bilgileri":
        return (
          <Documents
            documents={documents}
            setDocuments={setDocuments}
            formErrors={formErrors}
            isCourier={true}
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

export default CourierRegistration;
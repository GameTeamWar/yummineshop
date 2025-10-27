import React, { useState } from 'react';
import { X, ChevronRight, MapPin, Phone, Clock, Building2 } from 'lucide-react';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBranch: (branchData: any) => void;
}

const AddBranchModal: React.FC<AddBranchModalProps> = ({ isOpen, onClose, onAddBranch }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [branchData, setBranchData] = useState({
    name: '',
    address: '',
    phone: '',
    workingHours: {
      monday: { open: '09:00', close: '22:00', isOpen: true },
      tuesday: { open: '09:00', close: '22:00', isOpen: true },
      wednesday: { open: '09:00', close: '22:00', isOpen: true },
      thursday: { open: '09:00', close: '22:00', isOpen: true },
      friday: { open: '09:00', close: '22:00', isOpen: true },
      saturday: { open: '09:00', close: '22:00', isOpen: true },
      sunday: { open: '09:00', close: '22:00', isOpen: true },
    },
    latitude: '',
    longitude: '',
    branchPassword: '',
  });

  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onAddBranch(branchData);
    onClose();
    // Reset form
    setCurrentStep(1);
    setBranchData({
      name: '',
      address: '',
      phone: '',
      workingHours: {
        monday: { open: '09:00', close: '22:00', isOpen: true },
        tuesday: { open: '09:00', close: '22:00', isOpen: true },
        wednesday: { open: '09:00', close: '22:00', isOpen: true },
        thursday: { open: '09:00', close: '22:00', isOpen: true },
        friday: { open: '09:00', close: '22:00', isOpen: true },
        saturday: { open: '09:00', close: '22:00', isOpen: true },
        sunday: { open: '09:00', close: '22:00', isOpen: true },
      },
      latitude: '',
      longitude: '',
      branchPassword: '',
    });
  };

  const updateWorkingHours = (day: string, field: string, value: string | boolean) => {
    setBranchData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
          [field]: value,
        },
      },
    }));
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Şube Bilgileri</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Şube Adı *</label>
              <input
                type="text"
                value={branchData.name}
                onChange={(e) => setBranchData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Kadıköy Şubesi"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Telefon Numarası *</label>
              <input
                type="tel"
                value={branchData.phone}
                onChange={(e) => setBranchData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: +90 216 123 45 67"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Adres Bilgileri</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Adres *</label>
              <textarea
                value={branchData.address}
                onChange={(e) => setBranchData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="Şube adresini detaylı olarak giriniz"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enlem</label>
                <input
                  type="text"
                  value={branchData.latitude}
                  onChange={(e) => setBranchData(prev => ({ ...prev, latitude: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="41.0082"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Boylam</label>
                <input
                  type="text"
                  value={branchData.longitude}
                  onChange={(e) => setBranchData(prev => ({ ...prev, longitude: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="28.9784"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Çalışma Saatleri</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(branchData.workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-20 text-sm text-gray-300 capitalize">
                    {day === 'monday' ? 'Pazartesi' :
                     day === 'tuesday' ? 'Salı' :
                     day === 'wednesday' ? 'Çarşamba' :
                     day === 'thursday' ? 'Perşembe' :
                     day === 'friday' ? 'Cuma' :
                     day === 'saturday' ? 'Cumartesi' : 'Pazar'}
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={(e) => updateWorkingHours(day, 'isOpen', e.target.checked)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Açık</span>
                  </label>
                  {hours.isOpen && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateWorkingHours(day, 'open', e.target.value)}
                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateWorkingHours(day, 'close', e.target.value)}
                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Şube Şifresi</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Şube Ekleme Şifresi *</label>
              <input
                type="password"
                value={branchData.branchPassword}
                onChange={(e) => setBranchData(prev => ({ ...prev, branchPassword: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ana şubeden aldığınız şifreyi giriniz"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                Bu şifre ana şubeden alınmış olmalıdır. Şifre doğru girilmezse şube eklenemez.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Yeni Şube Ekle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-12 h-0.5 ${
                      i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-400">
            Adım {currentStep} / {totalSteps}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Geri
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              İptal
            </button>
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>İleri</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Şube Ekle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBranchModal;
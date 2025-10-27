import React, { useState, useEffect } from 'react';
import { X, Search, Check, X as CloseIcon, Send, UserCheck, Building2, AlertCircle } from 'lucide-react';

interface BranchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
}

interface ManagedBranch {
  id: string;
  name: string;
  code: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  requesterId: string;
  requesterName: string;
}

interface ManagingBranch {
  id: string;
  name: string;
  code: string;
  managedSince: string;
  isActive: boolean;
  managerId: string;
  managerName: string;
}

interface PendingRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  branchId: string;
  branchName: string;
  branchCode: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const BranchManagementModal: React.FC<BranchManagementModalProps> = ({
  isOpen,
  onClose,
  partnerId,
}) => {
  const [activeTab, setActiveTab] = useState<'managing' | 'status' | 'search' | 'requests'>('managing');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [branchCode, setBranchCode] = useState('');
  const [managedBranches, setManagedBranches] = useState<ManagedBranch[]>([]);
  const [managingBranches, setManagingBranches] = useState<ManagingBranch[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    if (isOpen) {
      // Firebase'den gerçek verileri çek
      fetchManagingBranches();
      fetchManagedBranches();
      fetchPendingRequests();
    }
  }, [isOpen, partnerId]);

  // Yönettiğim şubeleri Firebase'den çek
  const fetchManagingBranches = async () => {
    try {
      const response = await fetch(`/api/branches?partnerId=${partnerId}&managed=true`);
      if (response.ok) {
        const branches = await response.json();
        setManagingBranches(branches.map((branch: any) => ({
          id: branch.id,
          name: branch.name,
          code: branch.code || `BRANCH${branch.id.slice(-3).toUpperCase()}`,
          managedSince: branch.createdAt,
          isActive: branch.isActive !== false,
          managerId: branch.managerId || partnerId,
          managerName: branch.managerName || 'Ben'
        })));
      }
    } catch (error) {
      console.error('Şube verilerini çekme hatası:', error);
      setManagingBranches([]);
    }
  };

  // Beni yöneten şubeleri çek
  const fetchManagedBranches = async () => {
    try {
      const response = await fetch(`/api/branches/managed?partnerId=${partnerId}`);
      if (response.ok) {
        const branches = await response.json();
        setManagedBranches(branches);
      }
    } catch (error) {
      console.error('Yönetilen şube verilerini çekme hatası:', error);
      setManagedBranches([]);
    }
  };

  // Bekleyen talepleri çek
  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`/api/branches/requests?partnerId=${partnerId}`);
      if (response.ok) {
        const requests = await response.json();
        setPendingRequests(requests);
      }
    } catch (error) {
      console.error('Bekleyen talepleri çekme hatası:', error);
      setPendingRequests([]);
    }
  };

  // Şube arama fonksiyonu
  const searchBranches = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/branches/search?q=${encodeURIComponent(query)}&excludePartnerId=${partnerId}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Şube arama hatası:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Onay talebi gönderme
  const sendApprovalRequest = async () => {
    if (!selectedBranch || !branchCode.trim()) {
      alert('Lütfen şube seçin ve şube kodunu girin.');
      return;
    }

    if (branchCode !== selectedBranch.code) {
      alert('Şube kodu yanlış!');
      return;
    }

    try {
      const response = await fetch('/api/branches/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId: partnerId,
          branchId: selectedBranch.id,
          branchCode: branchCode
        }),
      });

      if (response.ok) {
        alert(`"${selectedBranch.name}" şubesine onay talebi gönderildi!`);
        setSelectedBranch(null);
        setBranchCode('');
        setSearchQuery('');
        setSearchResults([]);
      } else {
        const error = await response.json();
        alert(error.message || 'Onay talebi gönderilemedi.');
      }
    } catch (error) {
      console.error('Onay talebi gönderme hatası:', error);
      alert('Onay talebi gönderilemedi.');
    }
  };

  // Yönetildiğim şubeler için izin iptali
  const revokePermission = async (branchId: string) => {
    if (!confirm('Bu şubenin sizi yönetme iznini iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/branches/requests/${branchId}/revoke`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: partnerId
        }),
      });

      if (response.ok) {
        setManagedBranches(prev =>
          prev.map(branch =>
            branch.id === branchId
              ? { ...branch, status: 'rejected' as const }
              : branch
          )
        );
        alert('İzin başarıyla iptal edildi.');
        fetchManagedBranches(); // Listeyi yenile
      } else {
        alert('İzin iptal edilemedi.');
      }
    } catch (error) {
      console.error('İzin iptal hatası:', error);
      alert('İzin iptal edilemedi.');
    }
  };

  // Yönettiğim şubeler için yönetim iptali
  const revokeManagement = async (branchId: string) => {
    if (!confirm('Bu şubeyi yönetme izninizi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/branches/management/${branchId}/revoke`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          managerId: partnerId
        }),
      });

      if (response.ok) {
        setManagingBranches(prev => prev.filter(branch => branch.id !== branchId));
        alert('Yönetim izni başarıyla iptal edildi.');
      } else {
        alert('Yönetim izni iptal edilemedi.');
      }
    } catch (error) {
      console.error('Yönetim izni iptal hatası:', error);
      alert('Yönetim izni iptal edilemedi.');
    }
  };

  // Gelen talebi onaylama
  const approveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/branches/requests/${requestId}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        setPendingRequests(prev =>
          prev.map(request =>
            request.id === requestId
              ? { ...request, status: 'approved' as const }
              : request
          )
        );
        alert('Talep onaylandı.');
        fetchPendingRequests(); // Listeyi yenile
      } else {
        alert('Talep onaylanamadı.');
      }
    } catch (error) {
      console.error('Talep onaylama hatası:', error);
      alert('Talep onaylanamadı.');
    }
  };

  // Gelen talebi reddetme
  const rejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/branches/requests/${requestId}/reject`, {
        method: 'PUT',
      });

      if (response.ok) {
        setPendingRequests(prev =>
          prev.map(request =>
            request.id === requestId
              ? { ...request, status: 'rejected' as const }
              : request
          )
        );
        alert('Talep reddedildi.');
        fetchPendingRequests(); // Listeyi yenile
      } else {
        alert('Talep reddedilemedi.');
      }
    } catch (error) {
      console.error('Talep reddetme hatası:', error);
      alert('Talep reddedilemedi.');
    }
  };

  // Yönettiğim şubeler için aktif/pasif toggle
  const toggleManagingBranch = async (branchId: string) => {
    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !managingBranches.find(b => b.id === branchId)?.isActive
        }),
      });

      if (response.ok) {
        setManagingBranches(prev =>
          prev.map(branch =>
            branch.id === branchId
              ? { ...branch, isActive: !branch.isActive }
              : branch
          )
        );
      } else {
        alert('Şube durumu güncellenemedi.');
      }
    } catch (error) {
      console.error('Şube durumu güncelleme hatası:', error);
      alert('Şube durumu güncellenirken hata oluştu.');
    }
  };

  // Şube silme fonksiyonu
  const deleteManagingBranch = async (branchId: string) => {
    // Bu fonksiyon artık kullanılmıyor, revokeManagement kullanılıyor
    revokeManagement(branchId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Şube Yönetimi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('managing')}
            className={`flex-1 px-4 py-4 text-center font-medium transition-colors text-sm ${
              activeTab === 'managing'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-600/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Yönettiğim Şubeler
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 px-4 py-4 text-center font-medium transition-colors text-sm ${
              activeTab === 'status'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-600/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Aktif/Pasif
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-4 py-4 text-center font-medium transition-colors text-sm ${
              activeTab === 'search'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-600/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Şube Arama
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-4 text-center font-medium transition-colors text-sm ${
              activeTab === 'requests'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-600/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Gelen Talepler
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'managing' ? (
            /* Yönettiğim Şubeler Tab - Silme özelliği ile */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Yönettiğim Şubeler</h3>
                <div className="space-y-3">
                  {managingBranches.map((branch) => (
                    <div key={branch.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-white font-medium">{branch.name}</p>
                            <p className="text-gray-400 text-sm">Kod: {branch.code}</p>
                            <p className="text-gray-400 text-xs">
                              Yönetim Başlangıcı: {new Date(branch.managedSince).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => revokeManagement(branch.id)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-colors text-sm"
                          >
                            Yönetimi İptal Et
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {managingBranches.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Henüz hiç şube yönetmiyorsunuz.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'status' ? (
            /* Aktif/Pasif Şubeler Tab */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Aktif/Pasif Şubeler</h3>
                <div className="space-y-3">
                  {managingBranches.map((branch) => (
                    <div key={branch.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-white font-medium">{branch.name}</p>
                            <p className="text-gray-400 text-sm">Kod: {branch.code}</p>
                            <p className="text-gray-400 text-xs">
                              Yönetim Başlangıcı: {new Date(branch.managedSince).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            branch.isActive
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-gray-600/20 text-gray-400'
                          }`}>
                            {branch.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                          <button
                            onClick={() => toggleManagingBranch(branch.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              branch.isActive ? 'bg-green-500' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                branch.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {managingBranches.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Henüz hiç şube yönetmiyorsunuz.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'search' ? (
            /* Şube Arama & Talep Gönderme Tab */
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">Şube Arama ve Yönetim Talebi</h3>

                {/* Arama */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Şube adı veya kodu ile arama yapın..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchBranches(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Arama Sonuçları */}
                {searchResults.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Arama Sonuçları ({searchResults.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.map((branch) => (
                        <div
                          key={branch.id}
                          onClick={() => setSelectedBranch(branch)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                            selectedBranch?.id === branch.id
                              ? 'bg-blue-600/20 border-blue-500'
                              : 'bg-gray-600 hover:bg-gray-500 border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{branch.name}</p>
                              <p className="text-gray-400 text-sm">Kod: {branch.code}</p>
                            </div>
                            {selectedBranch?.id === branch.id && (
                              <Check className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Arama yapılıyor göstergesi */}
                {isSearching && searchQuery.length >= 2 && (
                  <div className="mb-4 text-center py-4">
                    <div className="inline-flex items-center space-x-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Arama yapılıyor...</span>
                    </div>
                  </div>
                )}

                {/* Sonuç bulunamadı */}
                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="mb-4 text-center py-4 text-gray-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aramanızla eşleşen şube bulunamadı.</p>
                  </div>
                )}

                {/* Seçili Şube için Kod Girişi */}
                {selectedBranch && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        <strong>{selectedBranch.name}</strong> şubesine yönetim talebi göndermek için şube kodunu girin:
                      </p>
                    </div>
                    <input
                      type="text"
                      placeholder="Şube kodunu girin"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendApprovalRequest}
                      disabled={!branchCode.trim()}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Yönetim Talebi Gönder</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Gelen Talepler Tab */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Gelen Yönetim Talepleri</h3>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-white font-medium">{request.branchName}</p>
                            <p className="text-gray-400 text-sm">Kod: {request.branchCode}</p>
                            <p className="text-gray-400 text-xs">
                              Talep Eden: {request.requesterName} • {new Date(request.requestedAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {request.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => approveRequest(request.id)}
                                className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 rounded-lg transition-colors text-sm"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => rejectRequest(request.id)}
                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-colors text-sm"
                              >
                                Reddet
                              </button>
                            </>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved'
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-red-600/20 text-red-400'
                            }`}>
                              {request.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Bekleyen yönetim talebi yok.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mevcut İzinler */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Mevcut İzinler (Beni Yöneten Şubeler)</h3>
                <div className="space-y-3">
                  {managedBranches.filter(branch => branch.status === 'approved').map((branch) => (
                    <div key={branch.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-white font-medium">{branch.name}</p>
                            <p className="text-gray-400 text-sm">Kod: {branch.code}</p>
                            <p className="text-gray-400 text-xs">
                              Onay: {new Date(branch.approvedAt || branch.requestedAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => revokePermission(branch.id)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-colors text-sm"
                          >
                            İzni İptal Et
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {managedBranches.filter(branch => branch.status === 'approved').length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Henüz hiç şube sizi yönetmiyor.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchManagementModal;
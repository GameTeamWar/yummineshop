'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Güçlü şifre oluşturma fonksiyonu
const generateStrongPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Dosya yükleme yardımcı fonksiyonu
const uploadFileToStorage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

interface AuthContextType {
  user: User | null;
  role: number | null;
  loading: boolean;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: number, additionalData?: any) => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeaders: () => Promise<{ Authorization?: string }>;
  getProfile: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>({
  user: null,
  role: null,
  loading: true,
  darkMode: false,
  setDarkMode: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  getAuthHeaders: async () => ({}),
  getProfile: () => ({}),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const router = useRouter();

  // Bildirimleri başlat
  useNotifications();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', darkMode.toString());
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Firestore'dan profil bilgilerini al
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let profileData = {};
        let userRole = null;

        if (userDoc.exists()) {
          const data = userDoc.data();
          profileData = {
            displayName: data.displayName || data.firstName + ' ' + data.lastName || user.displayName,
            phoneNumber: data.phoneNumber || data.phone || user.phoneNumber,
            address: data.address,
            bio: data.bio,
            createdAt: data.createdAt,
            ...data
          };
          userRole = data.role;
        }

        // User objesini ve profil bilgilerini ayrı ayrı sakla
        setUser(user);
        setUserProfile(profileData);
        setRole(userRole);
      } else {
        setUser(null);
        setUserProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isMounted]);

  if (!isMounted) {
    return <>{children}</>; // Return children without auth context during SSR
  }

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Kullanıcının rolünü Firestore'dan al ve yönlendirme yap
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        // Role göre yönlendirme
        setTimeout(() => {
          switch (userRole) {
            case 0: // Normal kullanıcı
              router.push('/');
              break;
            case 1: // Partner
              router.push(`/partner/${userCredential.user.uid}`);
              break;
            case 2: // Admin
              router.push('/admin');
              break;
            case 3: // Courier
              router.push('/courier');
              break;
            default:
              router.push('/');
          }
        }, 100); // Kısa bir gecikme ile state güncellemesini bekle
      }
    } catch (error: any) {
      // Firebase hata kodlarını kullanıcı dostu mesajlara dönüştür
      let errorMessage = 'Giriş yapılırken bir hata oluştu.';

      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'E-posta adresi veya şifre yanlış. Lütfen bilgilerinizi kontrol edin.';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        case 'auth/user-not-found':
          errorMessage = 'Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        case 'auth/wrong-password':
          errorMessage = 'Şifre yanlış. Lütfen tekrar deneyin.';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        case 'auth/user-disabled':
          errorMessage = 'Bu hesap devre dışı bırakılmış. Lütfen destek ile iletişime geçin.';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen bir süre bekleyin ve tekrar deneyin.';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi formatı.';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        case 'auth/network-request-failed':
          errorMessage = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          break;
        default:
          errorMessage = error.message || 'Bilinmeyen bir hata oluştu.';
      }

      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, role: number, additionalData?: any) => {
    try {
      console.log('Registering user:', { email, passwordLength: password.length, role });

      // Kurye için otomatik 6-digit sayısal şifre oluştur
      const generateRandomPassword = () => {
        const chars = '0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const finalPassword = role === 3 ? generateRandomPassword() : password;

      console.log('Final password length:', finalPassword.length);

      const userCredential = await createUserWithEmailAndPassword(auth, email, finalPassword);
      const user = userCredential.user;

      console.log('User created successfully:', user.uid);

      // Logo dosyasını yükle (varsa)
      let logoURL = null;
      if (additionalData?.logo && additionalData.logo instanceof File) {
        try {
          const logoPath = `logos/${user.uid}/${additionalData.logo.name}`;
          logoURL = await uploadFileToStorage(additionalData.logo, logoPath);
          console.log('Logo uploaded successfully:', logoURL);
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          // Logo yükleme hatası olsa bile kayıt devam etsin
        }
      }

      // Yetkili kişilerin kimlik dosyalarını yükle
      let processedAuthorizedPersons = additionalData?.authorizedPersons || [];
      if (processedAuthorizedPersons.length > 0) {
        processedAuthorizedPersons = await Promise.all(
          processedAuthorizedPersons.map(async (person: any, index: number) => {
            if (person.idCard && person.idCard instanceof File) {
              try {
                const idCardPath = `id-cards/${user.uid}/authorized-${index}/${person.idCard.name}`;
                const idCardURL = await uploadFileToStorage(person.idCard, idCardPath);
                console.log(`Authorized person ${index} ID card uploaded:`, idCardURL);
                return { ...person, idCard: idCardURL }; // File yerine URL
              } catch (uploadError) {
                console.error(`Authorized person ${index} ID card upload failed:`, uploadError);
                return { ...person, idCard: null }; // Upload başarısız olursa null
              }
            }
            return person;
          })
        );
      }

      // Evrak dosyalarını yükle
      let processedDocuments = { ...additionalData };
      const documentFields = ['idCard', 'driversLicense', 'taxCertificate'];
      
      for (const field of documentFields) {
        if (processedDocuments[field] && processedDocuments[field] instanceof File) {
          try {
            const docPath = `documents/${user.uid}/${field}/${processedDocuments[field].name}`;
            const docURL = await uploadFileToStorage(processedDocuments[field], docPath);
            console.log(`${field} uploaded successfully:`, docURL);
            processedDocuments[field] = docURL; // File yerine URL
          } catch (uploadError) {
            console.error(`${field} upload failed:`, uploadError);
            processedDocuments[field] = null; // Upload başarısız olursa null
          }
        }
      }

      // Kullanıcı verilerini Firestore'a kaydet
      const userData = {
        email,
        role,
        userId: additionalData?.userId, // Benzersiz kullanıcı ID'si
        ...processedDocuments,
        logoURL, // File objesi yerine download URL
        authorizedPersons: processedAuthorizedPersons, // İşlenmiş yetkili kişiler
        createdAt: new Date(),
      };

      // Logo alanını kaldır (zaten logoURL olarak eklendi)
      delete userData.logo;

      await setDoc(doc(db, 'users', user.uid), userData);

      console.log('User data saved to Firestore');

      // Mağaza rolüyle kayıt ise otomatik mağaza oluştur
      if (role === 1) {
        try {
          const storeData = {
            name: additionalData?.storeName || `${additionalData?.firstName} ${additionalData?.lastName} Mağazası`,
            ownerId: user.uid,
            ownerName: `${additionalData?.firstName} ${additionalData?.lastName}`, // Mağaza sahibi adı
            status: 'pending', // Admin onayı bekler
            email: email,
            phone: additionalData?.phone || additionalData?.phoneNumber,
            address: `${additionalData?.province || ''} ${additionalData?.district || ''} ${additionalData?.neighborhood || ''} ${additionalData?.street || ''} ${additionalData?.detailedAddress || ''}`.trim(),
            category: additionalData?.category || 'general',
            storeType: additionalData?.storeType || 'esnaf',
            categories: additionalData?.categories || [], // Ana kategoriler
            subCategories: additionalData?.subCategories || [], // Alt kategoriler
            description: additionalData?.description,
            logo: logoURL, // Logo URL'si
            isActive: false, // Admin onayı bekler
            createdAt: new Date(),
            updatedAt: new Date(),
            // Eksik olan mağaza bilgileri
            taxId: additionalData?.taxId,
            companyName: additionalData?.companyName,
            corporateType: additionalData?.corporateType,
            iban: additionalData?.iban,
            branchCount: additionalData?.branchCount || 1,
            isMainBranch: additionalData?.isMainBranch || false,
            branchReferenceCode: additionalData?.branchReferenceCode,
            hasBranches: additionalData?.hasBranches || false,
            hasAuthorizedPersons: additionalData?.hasAuthorizedPersons || false,
            // Belgeler
            documents: {
              idCard: processedDocuments.idCard,
              driversLicense: processedDocuments.driversLicense,
              taxCertificate: processedDocuments.taxCertificate,
            },
            // Yetkili kişiler
            authorizedPersons: processedAuthorizedPersons,
            // Adres detayları
            location: {
              province: additionalData?.province,
              district: additionalData?.district,
              neighborhood: additionalData?.neighborhood,
              street: additionalData?.street,
              detailedAddress: additionalData?.detailedAddress,
              latitude: additionalData?.latitude,
              longitude: additionalData?.longitude,
            },
          };

          const storeResponse = await fetch('/api/stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(storeData)
          });

          if (storeResponse.ok) {
            const storeResult = await storeResponse.json();
            console.log('Store created successfully:', storeResult);

            // Kullanıcıya mağaza ID'sini ekle
            await setDoc(doc(db, 'users', user.uid), {
              ...userData,
              storeId: storeResult.id,
            });
          } else {
            console.error('Store creation failed');
          }
        } catch (storeError) {
          console.error('Store creation error:', storeError);
          // Mağaza oluşturma hatası olsa bile kullanıcı kaydı devam etsin
        }
      }

      // Mağaza ise şube izin sistemi için giriş oluştur
      if (role === 1 && additionalData?.branchReferenceCode) {
        await setDoc(doc(db, 'branch_permissions', additionalData.branchReferenceCode), {
          mainBranchEmail: email,
          mainBranchName: additionalData.storeName,
          branchReferenceCode: additionalData.branchReferenceCode,
          totalBranches: additionalData.branchCount,
          permissionRequests: [],
          approvedBranches: [],
          createdAt: new Date(),
        });
        console.log('Branch permissions created');
      }

      // Kayıt sonrası email gönderme (partner için)
      if (role === 1 || role === 3) { // Mağaza veya kurye
        await sendRegistrationEmail(email, { ...additionalData, generatedPassword: role === 3 ? finalPassword : undefined });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Firebase hata kodlarını kullanıcı dostu mesajlara dönüştür
      let errorMessage = 'Kayıt olurken bir hata oluştu.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Bu e-posta adresi zaten kullanımda. Giriş yapmak mı istiyorsunuz?';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClick: () => {
              // Kullanıcıya login sayfasına yönlendirme önerisi
              window.location.href = '/auth/login';
            }
          });
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi formatı.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Şifre çok zayıf. En az 6 karakter kullanın.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Kayıt işlemi şu anda devre dışı. Lütfen destek ile iletişime geçin.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla kayıt denemesi. Lütfen bir süre bekleyin ve tekrar deneyin.';
          break;
        default:
          console.error('Unknown Firebase Auth error:', error);
          errorMessage = `Kayıt hatası: ${error.message || 'Bilinmeyen hata'}`;
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  // Kayıt sonrası email gönderme fonksiyonu
  const sendRegistrationEmail = async (email: string, additionalData?: any) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, additionalData })
      });

      if (!response.ok) {
        throw new Error('Email gönderme başarısız');
      }

      const result = await response.json();
      console.log('Email gönderildi:', result);

    } catch (error) {
      console.error('Email gönderme hatası:', error);
      // Email gönderme hatası olsa bile kayıt devam etsin
    }
  };

  const getAuthHeaders = async (): Promise<{ Authorization?: string }> => {
    if (user) {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const getProfile = () => {
    return userProfile;
  };

  const value = {
    user,
    role,
    loading,
    darkMode,
    setDarkMode,
    login,
    register,
    logout,
    getAuthHeaders,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
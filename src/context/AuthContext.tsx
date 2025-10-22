'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'react-toastify';

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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: number, additionalData?: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
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

  // Bildirimleri başlat
  useNotifications();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Rolü Firestore'dan al
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setUser(null);
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
      await signInWithEmailAndPassword(auth, email, password);
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
        ...processedDocuments,
        logoURL, // File objesi yerine download URL
        authorizedPersons: processedAuthorizedPersons, // İşlenmiş yetkili kişiler
        createdAt: new Date(),
      };

      // Logo alanını kaldır (zaten logoURL olarak eklendi)
      delete userData.logo;

      await setDoc(doc(db, 'users', user.uid), userData);

      console.log('User data saved to Firestore');

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
          errorMessage = 'Bu e-posta adresi zaten kullanımda. Farklı bir e-posta adresi deneyin.';
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

  const value = {
    user,
    role,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
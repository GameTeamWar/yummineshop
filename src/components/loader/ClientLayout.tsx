'use client';

import { ReactNode } from 'react';
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CartPreloader from "@/components/loader/CartPreloader";

interface ClientLayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <CartPreloader />
    </div>
    );
  }

  return <>{children}</>;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}
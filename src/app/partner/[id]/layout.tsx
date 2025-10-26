'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PartnerLayout from '@/components/partner/panels/layout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || (role !== 1 && role !== 3)) {
      router.push('/auth/login?type=partner');
    }
  }, [user, role, router]);

  if (!user || (role !== 1 && role !== 3)) {
    return null;
  }

  return <PartnerLayout>{children}</PartnerLayout>;
}
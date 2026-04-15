"use client";

import LoginForm from '@/app/ui/login-form';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
 
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace('/home');
    }
  }, [isBootstrapping, isAuthenticated, router]);

  if (isBootstrapping || isAuthenticated) {
    return null;
  }

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
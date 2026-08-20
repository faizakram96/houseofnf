'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </Suspense>
  );
}

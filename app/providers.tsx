'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { NotificationProvider, TransactionPopupProvider } from '@blockscout/app-sdk'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <TransactionPopupProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </TransactionPopupProvider>
    </NotificationProvider>
  )
} 
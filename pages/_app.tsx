import { FirebaseUserState } from '@/lib/firebase'
import { AuthProvider } from '@/components/AuthProvider'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps<{}>) {
  return (
    <main className={inter.className}>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster />
      </AuthProvider>
    </main>
  )
}

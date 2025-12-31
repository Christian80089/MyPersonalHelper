import { SignUpForm } from '@/components/sign-up-form'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Registrati | My Personal Helper - Dashboard Analisi',
  description: 'Crea il tuo account gratuito per accedere alla dashboard e gestire i tuoi progetti in modo sicuro.',
  keywords: 'signup, registrazione, dashboard, analytics, data',
  robots: 'noindex,nofollow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function SignUpPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-transparent">
      <SignUpForm />
    </main>
  )
}

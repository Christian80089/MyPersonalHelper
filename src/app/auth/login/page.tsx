import { LoginForm } from '@/components/login-form'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Accedi | DataMark - Dashboard Analisi',
  description: 'Accedi alla tua dashboard per visualizzare dati, analytics e gestire i tuoi progetti in modo sicuro.',
  robots: 'noindex,nofollow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function LoginPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-transparent">
      <LoginForm />
    </main>
  )
}

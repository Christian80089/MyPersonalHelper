// app/page.tsx - Landing page leggera
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/auth/login')
}
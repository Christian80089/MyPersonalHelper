// actions/auth.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * =====================================================================
 * AZIONI AUTENTICAZIONE
 * =====================================================================
 */

/**
 * 🔐 LOGIN CON EMAIL/PASSWORD
 * 
 * 1. Estrae credenziali da FormData
 * 2. Esegue signInWithPassword Supabase
 * 3. Redirect con errore o dashboard admin
 * 
 * @param formData - Contiene email e password
 */
export async function loginWithEmail(formData: FormData) {
  try {
    // 🚀 1. Crea client Supabase server-side
    const supabase = await createClient();
    
    // 🚀 2. Estrae ed esegue login
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    // 🚀 3. Gestione redirect
    if (error) {
      // Errore → pagina login con messaggio
      const errorMessage = encodeURIComponent(error.message);
      console.warn('❌ Login fallito:', error.message);
      redirect(`/signin?message=${errorMessage}`);
    }

    // ✅ Success → dashboard admin
    console.log('✅ Login riuscito, redirect admin');
    redirect('/admin');

  } catch (error) {
    // 💥 Errore inatteso
    console.error('💥 loginWithEmail CRASH:', error);
    const fallbackError = encodeURIComponent('Errore interno server');
    redirect(`/signin?message=${fallbackError}`);
  }
}
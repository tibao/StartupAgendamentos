import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com a chave "anon/public".
 * Respeita Row Level Security — só pode fazer o que as policies
 * do schema.sql permitem (ler vitrine pública, criar agendamento).
 * Seguro para ser usado em Server Components e Server Actions.
 */
export function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. Confira o .env.local.'
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

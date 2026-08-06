import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com a service_role key.
 * IGNORA Row Level Security — tem acesso total ao banco.
 * O `import 'server-only'` acima faz o build falhar se algum
 * componente client tentar importar este arquivo por engano.
 * Use somente em: painel admin, webhooks de pagamento, jobs internos.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Variáveis NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas. Confira o .env.local.'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

import 'server-only';

/**
 * ------------------------------------------------------------------
 * ENVIO DE WHATSAPP — Z-API
 * ------------------------------------------------------------------
 * Z-API automatiza um número de WhatsApp comum (conectado via QR
 * code no painel deles), então não exige aprovação de template como
 * a API oficial da Meta. Em compensação, não é um uso oficial da
 * plataforma do WhatsApp — existe risco (baixo, mas real) de bloqueio
 * do número em uso muito intenso. Ver README para detalhes.
 *
 * O `import 'server-only'` no topo faz o build falhar se algum
 * componente client tentar importar este arquivo — as credenciais
 * (ZAPI_TOKEN, ZAPI_CLIENT_TOKEN) nunca podem chegar ao navegador.
 * ------------------------------------------------------------------
 */

interface SendWhatsAppMessageInput {
  to: string; // aceita com ou sem formatação: "(11) 99999-0000" ou "5511999990000"
  message: string;
}

interface SendWhatsAppMessageResult {
  ok: boolean;
  error?: string;
}

export async function sendWhatsAppMessage({
  to,
  message,
}: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instanceId || !token || !clientToken) {
    console.error(
      '[WhatsApp] Credenciais da Z-API ausentes (ZAPI_INSTANCE_ID / ZAPI_TOKEN / ZAPI_CLIENT_TOKEN). Confira o .env.local.'
    );
    return { ok: false, error: 'missing_credentials' };
  }

  const phone = normalizePhoneNumber(to);

  try {
    const response = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': clientToken,
        },
        body: JSON.stringify({ phone, message }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`[WhatsApp] Z-API respondeu ${response.status}: ${body}`);
      return { ok: false, error: `zapi_status_${response.status}` };
    }

    return { ok: true };
  } catch (err) {
    console.error('[WhatsApp] Falha de rede ao chamar a Z-API:', err);
    return { ok: false, error: 'network_error' };
  }
}

/** Z-API espera só dígitos, com código do país (55 para o Brasil). */
function normalizePhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

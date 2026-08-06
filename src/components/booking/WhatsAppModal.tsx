'use client';

import { useState } from 'react';
import { Loader2, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatWhatsappInput } from '@/lib/utils';

interface WhatsAppModalProps {
  onClose: () => void;
  onSubmit: (whatsapp: string) => Promise<void>;
}

export function WhatsAppModal({ onClose, onSubmit }: WhatsAppModalProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = whatsapp.replace(/\D/g, '').length >= 10;

  async function handleSubmit() {
    if (!valid || loading) return;
    setLoading(true);
    await onSubmit(whatsapp);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center">
      <div className="animate-slide-up w-full max-w-md rounded-t-2xl bg-barber-surface p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-barber-red" />
            <span className="text-xs font-bold uppercase tracking-wide text-barber-muted">
              WhatsApp
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center text-barber-muted"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="mt-4 text-lg font-bold">Confirme com seu WhatsApp</h2>
        <p className="mt-1 text-sm text-barber-muted">
          Vamos enviar a confirmação do seu horário por lá. Nenhuma senha é
          necessária.
        </p>

        <input
          autoFocus
          value={whatsapp}
          onChange={(e) => setWhatsapp(formatWhatsappInput(e.target.value))}
          placeholder="(11) 99999-0000"
          inputMode="numeric"
          className="mt-5 w-full border-b border-barber-border bg-transparent py-3 text-base outline-none placeholder:text-barber-muted focus:border-barber-red"
        />

        <Button
          fullWidth
          className="mt-4"
          disabled={!valid || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Confirmando...
            </>
          ) : (
            'Confirmar horário'
          )}
        </Button>
      </div>
    </div>
  );
}

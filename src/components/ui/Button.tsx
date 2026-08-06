'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  fullWidth,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-bold uppercase tracking-wide transition-colors duration-150 px-6 py-3.5 text-xs active:opacity-80 disabled:opacity-40 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary: 'bg-barber-red text-white hover:bg-barber-red/90',
    secondary: 'bg-white text-barber-bg hover:bg-white/90',
    outline: 'border border-white/25 text-white hover:border-white/50',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

export function BarberStripe({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-[6px] w-full ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(-45deg, #dc2626 0 10px, #f4f1ea 10px 20px, #2563eb 20px 30px, #f4f1ea 30px 40px)',
      }}
    />
  );
}

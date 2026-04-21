export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.75s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.12" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#6c5ce7" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

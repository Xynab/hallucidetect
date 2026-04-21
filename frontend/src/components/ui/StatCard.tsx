interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function StatCard({ label, value, sub, color = '#e2e2f0' }: Props) {
  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid rgba(108,92,231,0.13)',
      background: '#0f0f1a',
      padding: '14px 16px',
    }}>
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, color: '#3d3d5c',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em', marginBottom: 8,
      }}>{label}</p>
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700, fontSize: 26,
        lineHeight: 1, color,
      }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#3d3d5c', marginTop: 5 }}>{sub}</p>}
    </div>
  );
}

import type { VeracityLabel } from '../../types';

const CFG: Record<VeracityLabel, { bg: string; color: string; border: string; dot: string; label: string }> = {
  supported: {
    bg: 'rgba(52,211,153,0.1)', color: '#6ee7b7',
    border: 'rgba(52,211,153,0.3)', dot: '#34d399', label: 'Supported',
  },
  unsupported: {
    bg: 'rgba(248,113,113,0.1)', color: '#fca5a5',
    border: 'rgba(248,113,113,0.3)', dot: '#f87171', label: 'Hallucination',
  },
  insufficient_evidence: {
    bg: 'rgba(251,191,36,0.1)', color: '#fde68a',
    border: 'rgba(251,191,36,0.28)', dot: '#fbbf24', label: 'Unverifiable',
  },
};

interface Props { label: VeracityLabel; size?: 'sm' | 'md' }

export function Badge({ label, size = 'md' }: Props) {
  const c = CFG[label];
  const sm = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 5,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 500,
      fontSize: sm ? 10 : 11,
      padding: sm ? '2px 8px' : '3px 10px',
      borderRadius: 999,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap' as const,
      letterSpacing: '0.01em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

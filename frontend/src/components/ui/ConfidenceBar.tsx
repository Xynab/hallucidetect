import type { VeracityLabel } from '../../types';

const COLORS: Record<VeracityLabel, { bar: string; track: string }> = {
  supported:             { bar: '#34d399', track: 'rgba(52,211,153,0.12)' },
  unsupported:           { bar: '#f87171', track: 'rgba(248,113,113,0.12)' },
  insufficient_evidence: { bar: '#fbbf24', track: 'rgba(251,191,36,0.1)' },
};

interface Props { confidence: number; label: VeracityLabel }

export function ConfidenceBar({ confidence, label }: Props) {
  const c = COLORS[label];
  const p = Math.round(confidence * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 999, background: c.track, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${p}%`,
          background: c.bar, borderRadius: 999,
          transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, color: '#4d4d6e',
        minWidth: 30, textAlign: 'right' as const,
      }}>{p}%</span>
    </div>
  );
}

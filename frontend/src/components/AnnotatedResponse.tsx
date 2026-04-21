import { useState } from 'react';

interface Props {
  annotated: string;
  original: string;
}

type View = 'annotated' | 'original';

const LEGEND = [
  { label: 'Supported', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)' },
  { label: 'Hallucination', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)' },
  { label: 'Unverifiable', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
];

export function AnnotatedResponse({ annotated, original }: Props) {
  const [view, setView] = useState<View>('annotated');
  const [copied, setCopied] = useState(false);

  // Safeguard if backend sends null/undefined
  const safeAnnotated = annotated || '';
  const safeOriginal = original || '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(safeOriginal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const tabBtn = (v: View) => ({
    padding: '5px 12px',
    borderRadius: 7,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    background: view === v ? 'rgba(108,92,231,0.22)' : 'transparent',
    color: view === v ? '#a78bfa' : '#3d3d5c',
    transition: 'all 0.15s',
  });

  return (
    <div
      style={{
        borderRadius: 14,
        border: '1px solid rgba(108,92,231,0.13)',
        background: '#0f0f1a',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(108,92,231,0.1)',
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: '#4d4d6e',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2.5" stroke="#4d4d6e" strokeWidth="1.2" />
            <line x1="3.5" y1="4.5" x2="9.5" y2="4.5" stroke="#4d4d6e" strokeWidth="1" />
            <line x1="3.5" y1="7" x2="9.5" y2="7" stroke="#4d4d6e" strokeWidth="1" />
            <line x1="3.5" y1="9.5" x2="6.5" y2="9.5" stroke="#4d4d6e" strokeWidth="1" />
          </svg>
          Response analysis
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#080810',
              borderRadius: 9,
              border: '1px solid rgba(108,92,231,0.12)',
              padding: 2,
            }}
          >
            <button
              style={tabBtn('annotated')}
              onClick={() => setView('annotated')}
            >
              Annotated
            </button>

            <button
              style={tabBtn('original')}
              onClick={() => setView('original')}
            >
              Original
            </button>
          </div>

          {/* Copy */}
          <button
            onClick={copy}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: copied ? '#34d399' : '#3d3d5c',
              padding: '4px 8px',
              borderRadius: 6,
              transition: 'color 0.15s',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Legend */}
      {view === 'annotated' && (
        <div
          style={{
            display: 'flex',
            gap: 18,
            padding: '8px 16px',
            borderBottom: '1px solid rgba(108,92,231,0.08)',
            background: '#080810',
          }}
        >
          {LEGEND.map((l) => (
            <div
              key={l.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: '#3d3d5c',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  display: 'inline-block',
                  background: l.bg,
                  border: `1px solid ${l.border}`,
                }}
              />
              {l.label}
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      <div
        className="annotated-text"
        style={{
          padding: '18px 20px',
          fontSize: 13.5,
          color: '#8888a8',
          lineHeight: 2.1,
        }}
        dangerouslySetInnerHTML={{
          __html:
            view === 'annotated'
              ? safeAnnotated
              : safeOriginal.replace(/\n/g, '<br/>'),
        }}
      />
    </div>
  );
}
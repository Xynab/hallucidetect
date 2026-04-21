import { useState } from 'react';
import { Badge } from './ui/Badge';
import { ConfidenceBar } from './ui/ConfidenceBar';
import type { Claim } from '../types';

interface Props {
  claim: Claim;
  index: number;
}

const LABEL_TOOLTIPS: Record<string, string> = {
  supported: 'This claim is backed by retrieved grounding evidence with high confidence.',
  unsupported: 'Evidence contradicts this claim — it is likely a hallucination.',
  insufficient_evidence: 'No strong grounding evidence was found to verify or contradict this claim.',
};

export function ClaimCard({ claim, index }: Props) {
  const [open, setOpen] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);

  const tooltip = LABEL_TOOLTIPS[claim.label] || '';

  return (
    <div
      onClick={() => setOpen(v => !v)}
      style={{
        borderRadius: 12,
        border: `1px solid ${open ? 'rgba(108,92,231,0.35)' : 'rgba(108,92,231,0.13)'}`,
        background: open ? '#13131f' : '#0f0f1a',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = 'rgba(108,92,231,0.28)'; }}
      onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = 'rgba(108,92,231,0.13)'; }}
    >
      {/* Top row */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{
          flexShrink: 0, width: 24, height: 24, borderRadius: 7,
          background: '#13131f', border: '1px solid rgba(108,92,231,0.15)',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#3d3d5c',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
        }}>
          {String(index).padStart(2, '0')}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, color: '#c8c8e0', lineHeight: 1.6, marginBottom: 10 }}>
            {claim.text}
          </p>
          <ConfidenceBar confidence={claim.confidence} label={claim.label} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
          {/* Badge with tooltip */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={e => { e.stopPropagation(); setTipVisible(true); }}
            onMouseLeave={() => setTipVisible(false)}
            onClick={e => e.stopPropagation()}
          >
            <Badge label={claim.label} size="sm" />
            {tipVisible && (
              <div style={{
                position: 'absolute', bottom: '100%', right: 0, marginBottom: 8,
                background: '#1a1a2e', border: '1px solid rgba(108,92,231,0.25)',
                borderRadius: 8, padding: '8px 12px', width: 220, zIndex: 50,
                fontSize: 11, color: '#a0a0c0', lineHeight: 1.6,
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}>
                {tooltip}
              </div>
            )}
          </div>

          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
            <path d="M2 4.5l4 4 4-4" stroke="#3d3d5c" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Expanded section */}
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(108,92,231,0.1)' }}>

          {/* Explanation */}
          <p style={{ fontSize: 12, color: '#6c6c8a', marginTop: 12, marginBottom: 10, lineHeight: 1.7 }}>
            {claim.explanation}
          </p>

          {/* Evidence source */}
          {claim.evidence_source && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: '#a78bfa', marginBottom: 12,
              background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 6, padding: '3px 9px',
            }}>
              📚 {claim.evidence_source}
            </div>
          )}

          {/* Evidence passages */}
          {claim.evidence.filter(Boolean).length > 0 && (
            <>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#3d3d5c',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
              }}>
                Retrieved evidence
              </p>
              {claim.evidence.filter(Boolean).map((ev, i) => (
                <div key={i} style={{
                  fontSize: 12, color: '#6c6c8a', background: '#0a0a14',
                  border: '1px solid rgba(108,92,231,0.1)', borderRadius: 8,
                  padding: '10px 13px', lineHeight: 1.65, marginBottom: 6,
                  fontStyle: 'italic',
                }}>
                  "{ev}"
                </div>
              ))}
            </>
          )}

          {/* No evidence message */}
          {claim.evidence.filter(Boolean).length === 0 && (
            <div style={{
              fontSize: 12, color: '#3d3d5c', background: '#0a0a14',
              border: '1px solid rgba(108,92,231,0.08)', borderRadius: 8,
              padding: '10px 13px', lineHeight: 1.65,
            }}>
              No grounding passages retrieved for this claim.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
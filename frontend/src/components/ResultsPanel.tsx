import { ClaimCard } from './ClaimCard';
import { StatsPanel } from './StatsPanel';
import { AnnotatedResponse } from './AnnotatedResponse';
import { Badge } from './ui/Badge';
import type { AnalysisResult, VeracityLabel } from '../types';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export function ResultsPanel({ result, onReset }: Props) {

  // ==========================
  // Export JSON
  // ==========================
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hallucidetect-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // ==========================
  // Export PDF
  // ==========================
  const exportPDF = async () => {
    try {
      const res = await fetch('/api/v1/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!res.ok) throw new Error('PDF generation failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'hallucination_report.pdf';
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF');
    }
  };

  // ==========================
  // Claim Groups
  // ==========================
  const groups: VeracityLabel[] = [
    'unsupported',
    'insufficient_evidence',
    'supported',
  ];

  // ==========================
  // Button Style
  // ==========================
  const btnStyle = (primary = false): React.CSSProperties => ({
    padding: '8px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    background: primary ? '#6c5ce7' : '#13131f',
    color: primary ? '#fff' : '#aaa',
    border: '1px solid rgba(108,92,231,0.25)',
    opacity: result ? 1 : 0.5,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            🎯 Analysis Complete
          </h2>

          <p style={{ fontSize: 13, color: '#aaa' }}>
            {result.stats?.total_claims ?? 0} claims from {result.model_name}
          </p>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={btnStyle()}
            disabled={!result}
            onClick={downloadJSON}
          >
            📥 Export JSON
          </button>

          <button
            style={btnStyle(true)}
            disabled={!result}
            onClick={exportPDF}
          >
            📄 Export PDF
          </button>

          <button style={btnStyle()} onClick={onReset}>
            🔄 New Analysis
          </button>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 20,
        }}
      >
        {/* LEFT SIDE */}
        <div>
          <AnnotatedResponse
            annotated={result.annotated_response}
            original={result.response}
          />

          {groups.map((label) => {
            const claims = (result.claims || []).filter(
              (c) => c.label === label
            );

            if (!claims.length) return null;

            return (
              <div key={label} style={{ marginTop: 20 }}>
                <Badge label={label} />

                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {claims.map((c, i) => (
                    <ClaimCard key={c.id} claim={c} index={i + 1} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <div>
          <StatsPanel
            stats={result.stats}
            processingTime={result.processing_time_ms}
            modelName={result.model_name}
          />
        </div>
      </div>
    </div>
  );
}
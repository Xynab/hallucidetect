import { AnalysisForm } from '../components/AnalysisForm';
import { ResultsPanel } from '../components/ResultsPanel';
import { useAnalysis } from '../hooks/useAnalysis';

const STEPS = [
  { n: '01', title: 'Claim extraction',  body: 'Claude API or rule-based fallback decomposes the response into atomic verifiable facts.' },
  { n: '02', title: 'FAISS retrieval',   body: 'Dense vector search over knowledge passages returns top-k grounding evidence.' },
  { n: '03', title: 'NLI scoring',       body: 'DeBERTa cross-encoder classifies each claim as entailed, contradicted, or neutral.' },
  { n: '04', title: 'Audit report',      body: 'Span-level highlights, per-claim confidence scores, grade, and JSON export.' },
];

const PIPELINE_STEPS = ['Extracting claims', 'Retrieving evidence', 'NLI scoring', 'Building report'];

function LoadingSkeleton() {
  return (
    <div className="anim-fade-in" style={{ marginTop: 32 }}>
      {/* Pipeline progress */}
      <div style={{
        padding: '20px 24px', borderRadius: 14,
        background: '#0f0f1a', border: '1px solid rgba(108,92,231,0.18)',
        marginBottom: 16,
      }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          color: '#6c5ce7', marginBottom: 16, letterSpacing: '0.05em',
        }}>
          ◉ PIPELINE RUNNING
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: 'rgba(108,92,231,0.15)',
                border: '1px solid rgba(108,92,231,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#6c5ce7',
                  animation: `pulse-dot 1.5s ease-in-out ${i * 0.3}s infinite`,
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: '#6c6c8a', marginBottom: 4 }}>{step}</p>
                <div style={{
                  height: 3, borderRadius: 999,
                  background: '#13131f', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(108,92,231,0.6), transparent)',
                    backgroundSize: '200% 100%',
                    animation: `shimmer 1.5s ease-in-out ${i * 0.3}s infinite`,
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton claim cards */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 64, borderRadius: 12, marginBottom: 10,
          background: 'linear-gradient(90deg, #0f0f1a 0%, #13131f 50%, #0f0f1a 100%)',
          backgroundSize: '200% 100%',
          animation: `shimmer 1.8s ease-in-out ${i * 0.15}s infinite`,
          border: '1px solid rgba(108,92,231,0.08)',
        }} />
      ))}
    </div>
  );
}

export function Home() {
  const { result, loading, error, analyze, reset } = useAnalysis();

  return (
    <div style={{ minHeight: '100vh', background: '#080810' }}>

      {!result && (
        <div style={{ position: 'relative', paddingTop: 52, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(108,92,231,0.22) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 400,
            background: 'radial-gradient(ellipse, rgba(108,92,231,0.1) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '60px 28px 48px' }}>
            <div className="anim-fade-up d1" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6c5ce7',
                background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.28)',
                borderRadius: 999, padding: '4px 13px',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6c5ce7', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                Capstone project · AI / NLP
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#2e2e4a' }}>
                DeBERTa · FAISS · FastAPI · React
              </span>
            </div>

            <h1 className="anim-fade-up d2" style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(38px, 5.5vw, 68px)', lineHeight: 1.03,
              letterSpacing: '-2px', marginBottom: 22,
            }}>
              <span style={{
                background: 'linear-gradient(140deg, #fff 10%, #c4b5fd 55%, #6c5ce7 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>LLM Hallucination</span>
              <br />
              <span style={{ color: '#fff' }}>Detector</span>
            </h1>

            <p className="anim-fade-up d3" style={{
              fontSize: 15.5, color: '#6c6c8a', lineHeight: 1.75, maxWidth: 560, marginBottom: 44,
            }}>
              Paste any LLM response to extract atomic factual claims, retrieve grounding
              evidence via FAISS, and score each claim using DeBERTa NLI — with span-level
              highlights and a full audit report.
            </p>

            <div className="anim-fade-up d4" style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 56,
            }}>
              {STEPS.map(({ n, title, body }) => (
                <div key={n} style={{
                  padding: '16px 18px', borderRadius: 14,
                  border: '1px solid rgba(108,92,231,0.12)',
                  background: 'rgba(15,15,26,0.7)', backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,92,231,0.32)'; e.currentTarget.style.background = 'rgba(19,19,31,0.9)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(108,92,231,0.12)'; e.currentTarget.style.background = 'rgba(15,15,26,0.7)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6c5ce7', fontWeight: 600 }}>{n}</span>
                    <div style={{ height: 1, flex: 1, background: 'rgba(108,92,231,0.18)' }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#c8c8e0', marginBottom: 7, fontFamily: "'Syne', sans-serif" }}>{title}</p>
                  <p style={{ fontSize: 11.5, color: '#3d3d5c', lineHeight: 1.65 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: result ? '80px 28px 80px' : '0 28px 80px',
      }}>
        {!result ? (
          <div className="anim-fade-up d5" style={{ maxWidth: 660 }}>
            <div style={{
              borderRadius: 20, border: '1px solid rgba(108,92,231,0.2)',
              background: '#0f0f1a', padding: 30,
              boxShadow: '0 0 0 1px rgba(108,92,231,0.06), 0 8px 48px rgba(0,0,0,0.5), 0 0 60px rgba(108,92,231,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 4, height: 22, borderRadius: 999, background: 'linear-gradient(180deg, #6c5ce7, #4f46e5)' }} />
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>
                  Analyze a response
                </h2>
              </div>
              <AnalysisForm onSubmit={analyze} loading={loading} />
            </div>

            {loading && <LoadingSkeleton />}

            {error && (
              <div style={{
                marginTop: 16, padding: '14px 18px',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12,
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', marginBottom: 4 }}>Analysis failed</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(248,113,113,0.6)' }}>{error}</p>
                <p style={{ fontSize: 11, color: '#3d3d5c', marginTop: 7 }}>Make sure the backend is running on port 8000.</p>
              </div>
            )}
          </div>
        ) : (
          <ResultsPanel result={result} onReset={reset} />
        )}
      </div>
    </div>
  );
}
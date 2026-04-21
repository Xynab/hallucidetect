import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Claim {
  id: number;
  text: string;
  label: string;
  confidence: number;
  evidence: string[];
  explanation: string;
}

interface HistoryDetail {
  id: number;
  query: string;
  model_name: string;
  faithfulness: number;
  hallucination_rate: number;
  claims?: Claim[];
  created_at?: string;
}

const LABEL_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  supported:            { bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)", text: "#34d399", dot: "#34d399" },
  unsupported:          { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", text: "#f87171", dot: "#f87171" },
  insufficient_evidence:{ bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24", dot: "#fbbf24" },
};

const LABEL_NAMES: Record<string, string> = {
  supported: "Supported",
  unsupported: "Hallucination",
  insufficient_evidence: "Unverifiable",
};

export default function ResultView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<HistoryDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/history/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [id]);

  if (error) return (
    <div style={{ padding: "100px 28px", textAlign: "center", color: "#e2e2f0" }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
      <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Result not found</p>
      <button onClick={() => navigate("/history")} style={{
        padding: "10px 20px", borderRadius: 10, background: "#6c5ce7",
        border: "none", color: "#fff", cursor: "pointer", fontSize: 13,
      }}>← Back to History</button>
    </div>
  );

  if (!data) return (
    <div style={{ padding: "100px 28px", textAlign: "center", color: "#3d3d5c" }}>
      <p style={{ fontSize: 13 }}>Loading...</p>
    </div>
  );

  const faithPct = Math.round(data.faithfulness * 100);
  const hallPct  = Math.round(data.hallucination_rate * 100);

  return (
    <div style={{ padding: "80px 28px 60px", maxWidth: 900, margin: "0 auto", color: "#e2e2f0" }}>

      {/* Back button */}
      <button
        onClick={() => navigate("/history")}
        style={{
          background: "none", border: "none", color: "#6c6c8a",
          cursor: "pointer", fontSize: 13, marginBottom: 24, padding: 0,
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        ← Back to History
      </button>

      {/* Header */}
      <div style={{
        padding: "20px 24px", borderRadius: 14,
        background: "#0f0f1a", border: "1px solid rgba(108,92,231,0.18)",
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 12, color: "#3d3d5c", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>QUERY</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#e2e2f0", marginBottom: 16 }}>{data.query}</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            color: "#6c6c8a", background: "#13131f",
            border: "1px solid rgba(108,92,231,0.12)",
            padding: "3px 10px", borderRadius: 6,
          }}>
            {data.model_name || "unknown"}
          </span>
          <span style={{ fontSize: 13, color: "#34d399", fontWeight: 600 }}>
            ✓ {faithPct}% faithful
          </span>
          {hallPct > 0 && (
            <span style={{ fontSize: 13, color: "#f87171", fontWeight: 600 }}>
              ⚠ {hallPct}% hallucinated
            </span>
          )}
        </div>
      </div>

      {/* Claims */}
      {data.claims && data.claims.length > 0 ? (
        <div>
          <p style={{
            fontSize: 10, color: "#3d3d5c",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>
            {data.claims.length} CLAIMS
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.claims.map((c, i) => {
              const style = LABEL_COLORS[c.label] || LABEL_COLORS.insufficient_evidence;
              return (
                <div key={c.id} style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: style.bg, border: `1px solid ${style.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, color: "#3d3d5c",
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0, marginTop: 2,
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p style={{ fontSize: 13, color: "#c8c8e0", flex: 1, lineHeight: 1.6 }}>{c.text}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: style.text,
                      background: `${style.border}33`, border: `1px solid ${style.border}`,
                      borderRadius: 6, padding: "2px 8px", flexShrink: 0,
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: style.dot, display: "inline-block" }} />
                      {LABEL_NAMES[c.label] || c.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", paddingLeft: 24 }}>
                    <span style={{ fontSize: 11, color: "#3d3d5c" }}>
                      {Math.round(c.confidence * 100)}% confidence
                    </span>
                    {c.explanation && (
                      <span style={{ fontSize: 11, color: "#6c6c8a" }}>· {c.explanation}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "#3d3d5c", textAlign: "center", padding: 40 }}>
          Detailed claim data not available for this record.
        </p>
      )}
    </div>
  );
}
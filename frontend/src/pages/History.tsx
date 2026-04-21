import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface RecordItem {
  id: number;
  query: string;
  model_name: string;
  faithfulness: number;
  hallucination_rate: number;
  created_at?: string;
}

export function History() {
  const [data, setData] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/v1/history")
      .then(res => res.json())
      .then(res => {
        const records = Array.isArray(res) ? res : Array.isArray(res.records) ? res.records : [];
        // Deduplicate by query+model
        const seen = new Set<string>();
        const deduped = records.filter((r: RecordItem) => {
          const key = `${r.query}::${r.model_name}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setData(deduped);
        setLoading(false);
      })
      .catch(() => { setData([]); setLoading(false); });
  }, []);

  const filtered = data.filter(item =>
    item.query.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString();
    } catch { return null; }
  };

  const getFaithColor = (f: number) => {
    if (f >= 0.8) return "#34d399";
    if (f >= 0.5) return "#fbbf24";
    return "#f87171";
  };

  return (
    <div style={{ padding: "80px 28px 60px", color: "#e2e2f0", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(108,92,231,0.12)", border: "1px solid rgba(108,92,231,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>📊</div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>
            Analysis History
          </h2>
          <p style={{ fontSize: 12, color: "#3d3d5c", margin: 0, marginTop: 2 }}>
            {data.length} record{data.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        placeholder="Search history..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "10px 16px", marginBottom: 20,
          borderRadius: 10, background: "#13131f",
          border: "1px solid rgba(108,92,231,0.2)", color: "#fff",
          fontSize: 13, outline: "none", boxSizing: "border-box",
        }}
      />

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "#3d3d5c" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 13 }}>Loading history...</p>
        </div>
      )}

      {!loading && data.length === 0 && (
        <div style={{
          textAlign: "center", padding: 80,
          border: "1px dashed rgba(108,92,231,0.2)", borderRadius: 16,
          background: "rgba(108,92,231,0.03)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#c8c8e0", marginBottom: 8 }}>
            No analyses yet
          </p>
          <p style={{ fontSize: 13, color: "#3d3d5c", marginBottom: 24 }}>
            Run your first hallucination analysis to see results here.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 24px", borderRadius: 10,
              background: "#6c5ce7", border: "none",
              color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}
          >
            Start Analyzing →
          </button>
        </div>
      )}

      {!loading && data.length > 0 && filtered.length === 0 && (
        <p style={{ color: "#3d3d5c", fontSize: 13, textAlign: "center", padding: 40 }}>
          No results match "{search}"
        </p>
      )}

      {/* Records */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/result/${item.id}`)}
            style={{
              padding: "18px 20px", borderRadius: 14,
              background: "#0f0f1a",
              border: "1px solid rgba(108,92,231,0.18)",
              cursor: "pointer", transition: "all 0.18s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(108,92,231,0.45)";
              e.currentTarget.style.background = "#13131f";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(108,92,231,0.18)";
              e.currentTarget.style.background = "#0f0f1a";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#e2e2f0", flex: 1, marginRight: 16, lineHeight: 1.4 }}>
                {item.query}
              </p>
              <span style={{
                fontSize: 11, color: "#6c5ce7",
                fontFamily: "'JetBrains Mono', monospace",
                background: "rgba(108,92,231,0.1)",
                padding: "2px 8px", borderRadius: 5, flexShrink: 0,
              }}>
                View →
              </span>
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {/* Model badge */}
              <span style={{
                fontSize: 11, color: "#6c6c8a",
                background: "#13131f", border: "1px solid rgba(108,92,231,0.12)",
                borderRadius: 5, padding: "2px 8px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {item.model_name || "unknown"}
              </span>

              {/* Faithfulness */}
              <span style={{ fontSize: 12, color: getFaithColor(item.faithfulness), fontWeight: 600 }}>
                ✓ {(item.faithfulness * 100).toFixed(1)}% faithful
              </span>

              {/* Hallucination */}
              {item.hallucination_rate > 0 && (
                <span style={{ fontSize: 12, color: "#f87171", fontWeight: 600 }}>
                  ⚠ {(item.hallucination_rate * 100).toFixed(1)}% hallucinated
                </span>
              )}

              {/* Timestamp */}
              {formatDate(item.created_at) && (
                <span style={{ fontSize: 11, color: "#3d3d5c", marginLeft: "auto" }}>
                  {formatDate(item.created_at)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from './ui/StatCard';
import type { AnalysisStats } from '../types';

function gradeOf(score: number) {
  if (score >= 0.9) return { letter: 'A+', color: '#34d399', desc: 'Excellent' };
  if (score >= 0.8) return { letter: 'A',  color: '#34d399', desc: 'Very good' };
  if (score >= 0.7) return { letter: 'B',  color: '#86efac', desc: 'Good' };
  if (score >= 0.55) return { letter: 'C', color: '#fbbf24', desc: 'Moderate' };
  if (score >= 0.4) return { letter: 'D',  color: '#fb923c', desc: 'Poor' };
  return { letter: 'F', color: '#f87171', desc: 'Unreliable' };
}

interface Props {
  stats: AnalysisStats;
  processingTime: number;
  modelName: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1a1a2e', border: '1px solid rgba(108,92,231,0.25)',
        borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#e2e2f0',
      }}>
        <b>{payload[0].name}</b>: {payload[0].value}
      </div>
    );
  }
  return null;
};

export function StatsPanel({ stats, processingTime, modelName }: Props) {
  if (!stats) return null;

  const grade = gradeOf(stats.overall_faithfulness_score ?? 0);
  const faithfulnessPct = Math.round((stats.overall_faithfulness_score ?? 0) * 100);
  const hallucinationPct = Math.round((stats.hallucination_rate ?? 0) * 100);

  const pieData = [
    { name: 'Supported',    value: stats.supported ?? 0,            color: '#34d399' },
    { name: 'Contradicted', value: stats.unsupported ?? 0,           color: '#f87171' },
    { name: 'Unverifiable', value: stats.insufficient_evidence ?? 0, color: '#fbbf24' },
  ].filter(d => d.value > 0);

  const cardStyle: React.CSSProperties = {
    borderRadius: 14, border: '1px solid rgba(108,92,231,0.13)',
    background: '#0f0f1a', padding: '18px 20px',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
    color: '#3d3d5c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Grade Card */}
      <div style={cardStyle}>
        <p style={labelStyle}>Faithfulness score</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 14,
            background: `${grade.color}14`, border: `2px solid ${grade.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: grade.color }}>
              {grade.letter}
            </span>
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 34, color: '#fff' }}>
              {faithfulnessPct}%
            </div>
            <div style={{ fontSize: 12, color: '#4d4d6e', marginTop: 5 }}>{grade.desc}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#3d3d5c', marginTop: 4 }}>
              {modelName}
            </div>
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: '#13131f', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${faithfulnessPct}%`,
            background: `linear-gradient(90deg, ${grade.color}70, ${grade.color})`,
            transition: 'width 1.2s ease',
          }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatCard label="Total claims" value={stats.total_claims} sub="extracted" />
        <StatCard
          label="Hallucination"
          value={`${hallucinationPct}%`}
          sub={`${stats.unsupported} contradicted`}
          color={hallucinationPct > 30 ? '#f87171' : hallucinationPct > 10 ? '#fbbf24' : '#34d399'}
        />
        <StatCard label="Supported" value={stats.supported} sub="verified" color="#34d399" />
        <StatCard label="Unverifiable" value={stats.insufficient_evidence} sub="low evidence" color="#fbbf24" />
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div style={cardStyle}>
          <p style={labelStyle}>Claim distribution</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 82, height: 82 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={24} outerRadius={40} paddingAngle={4} strokeWidth={0}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: '#6c6c8a' }}>{d.name}</span>
                  </div>
                  <b style={{ color: '#fff', fontSize: 13 }}>{d.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timing */}
      <div style={{
        borderRadius: 10, border: '1px solid rgba(108,92,231,0.1)',
        background: '#080810', padding: '10px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 10, color: '#3d3d5c', fontFamily: "'JetBrains Mono', monospace" }}>
          pipeline timing
        </span>
        <b style={{ color: processingTime > 15000 ? '#fbbf24' : '#6c5ce7', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
          {processingTime?.toFixed(0)} ms
        </b>
      </div>

      {/* Grade legend */}
      <div style={{
        borderRadius: 10, border: '1px solid rgba(108,92,231,0.1)',
        background: '#080810', padding: '10px 14px',
      }}>
        <p style={{ ...labelStyle, marginBottom: 8 }}>Grade thresholds</p>
        {[
          { g: 'A+', range: '≥ 90%', c: '#34d399' },
          { g: 'A',  range: '≥ 80%', c: '#34d399' },
          { g: 'B',  range: '≥ 70%', c: '#86efac' },
          { g: 'C',  range: '≥ 55%', c: '#fbbf24' },
          { g: 'D',  range: '≥ 40%', c: '#fb923c' },
          { g: 'F',  range: '< 40%', c: '#f87171' },
        ].map(({ g, range, c }) => (
          <div key={g} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: "'Syne', sans-serif" }}>{g}</span>
            <span style={{ fontSize: 11, color: '#3d3d5c', fontFamily: "'JetBrains Mono', monospace" }}>{range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
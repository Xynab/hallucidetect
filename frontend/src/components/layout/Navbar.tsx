import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const BACKEND = 'https://hallucidetect-eq93.onrender.com';

const S = {
  nav: { position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 100, height: 52, display: 'flex', alignItems: 'center', background: 'rgba(8,8,16,0.88)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(108,92,231,0.13)' },
  inner: { maxWidth: 1300, margin: '0 auto', padding: '0 28px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  logoWrap: { width: 28, height: 28, borderRadius: 8, background: 'rgba(108,92,231,0.18)', border: '1px solid rgba(108,92,231,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff' },
  version: { fontSize: 10, color: '#6c5ce7', background: 'rgba(108,92,231,0.12)', borderRadius: 5, padding: '2px 7px' },
  right: { display: 'flex', alignItems: 'center', gap: 24 },
  statusDot: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 },
  dot: (online: boolean): React.CSSProperties => ({ width: 6, height: 6, borderRadius: '50%', background: online ? '#34d399' : '#ef4444', animation: 'pulse-dot 2.5s ease-in-out infinite' }),
  links: { display: 'flex', gap: 20 },
  link: { color: '#4d4d6e', fontSize: 13, textDecoration: 'none', cursor: 'pointer' },
};

export function Navbar() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/v1/health`);
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav style={S.nav}>
      <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={S.inner}>
        <div style={S.brand}>
          <div style={S.logoWrap}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <polyline points="1,13 4,7 7,10 10,4 13,8" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="13" cy="8" r="1.8" fill="#6c5ce7"/>
            </svg>
          </div>
          <span style={S.title}>HalluciDetect</span>
          <span style={S.version}>v1.0</span>
        </div>
        <div style={S.right}>
          <div style={S.statusDot}>
            <span style={S.dot(online)}/>
            <span style={{ color: online ? '#34d399' : '#ef4444' }}>
              {online ? 'API online' : 'API offline'}
            </span>
          </div>
          <div style={S.links}>
            <Link to="/history" style={S.link}>History</Link>
            <a href="https://github.com/Xynab/hallucidetect" target="_blank" rel="noreferrer" style={S.link}>GitHub</a>
            <a href={`${BACKEND}/docs`} target="_blank" rel="noreferrer" style={S.link}>API Docs</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

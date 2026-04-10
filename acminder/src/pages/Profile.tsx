import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const S = {
  page: {
    minHeight: '100dvh',
    background: '#F2F3F7',
    fontFamily: '-apple-system, "SF Pro Display", sans-serif',
  } as React.CSSProperties,
  inner: {
    maxWidth: 480,
    margin: '0 auto',
    paddingBottom: 110,
  } as React.CSSProperties,
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px 0',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px 0',
  } as React.CSSProperties,
};

function Row({ label, value, onClick, last = false }: { label: string; value?: string; onClick?: () => void; last?: boolean }) {
  const Wrapper: any = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: last ? 'none' : '0.5px solid #F0F0F0',
        background: 'none',
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box' as const,
        textAlign: 'left' as const,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {value && <span style={{ fontSize: 13, color: '#AAAAAA' }}>{value}</span>}
        {onClick && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        )}
      </div>
    </Wrapper>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '0.5px solid #F0F0F0', overflow: 'hidden', marginBottom: 12 }}>
      {children}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '20px 0 8px', padding: '0 4px' }}>
      {label}
    </div>
  );
}

export default function Profile() {
  const nav = useNavigate();
  const ctx = useContext(AppContext);
  const email = ctx?.user?.email || '';
  const items = ctx?.items || [];
  const conflicts = ctx?.conflicts || [];

  const raw = email.split('@')[0] || 'User';
  const displayName = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[._]/g, ' ');
  const initial = raw.charAt(0).toUpperCase();

  const totalItems = items.length;
  const completed = items.filter(i => i.completed).length;
  const unresolvedConflicts = conflicts.filter(c => !c.resolved).length;

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* Status bar */}
        <div style={S.statusBar}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0D0D0D' }}>9:41</span>
        </div>

        {/* Header */}
        <div style={S.header}>
          <button
            type="button"
            onClick={() => nav(-1)}
            style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', border: '0.5px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#0D0D0D' }}>Profile</span>
          <div style={{ width: 36 }} />
        </div>

        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 20px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, background: '#0D0D0D',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{initial}</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0D0D0D', marginBottom: 4 }}>{displayName}</div>
          <div style={{ fontSize: 13, color: '#AAAAAA' }}>{email}</div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 20px 4px' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '14px 0', border: '0.5px solid #F0F0F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#0D0D0D' }}>{totalItems}</span>
            <span style={{ fontSize: 10, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 3 }}>Items</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 18, padding: '14px 0', border: '0.5px solid #F0F0F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#0D0D0D' }}>{completed}</span>
            <span style={{ fontSize: 10, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 3 }}>Done</span>
          </div>
          <div style={{ background: unresolvedConflicts > 0 ? '#E8470A' : '#fff', borderRadius: 18, padding: '14px 0', border: '0.5px solid #F0F0F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: unresolvedConflicts > 0 ? '#fff' : '#0D0D0D' }}>{unresolvedConflicts}</span>
            <span style={{ fontSize: 10, color: unresolvedConflicts > 0 ? 'rgba(255,255,255,0.7)' : '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 3 }}>Conflicts</span>
          </div>
        </div>

        {/* Account info */}
        <div style={{ padding: '0 20px' }}>
          <SectionLabel label="Account" />
          <Card>
            <Row label="Name" value={displayName} />
            <Row label="Email" value={email} last />
          </Card>

          <SectionLabel label="Quick Links" />
          <Card>
            <Row label="Settings" onClick={() => nav('/settings')} />
            <Row label="Terms & Privacy" onClick={() => nav('/terms')} />
            <Row label="Import Calendar" onClick={() => nav('/import')} last />
          </Card>

          <SectionLabel label="App" />
          <Card>
            <Row label="Version" value="1.0.0" />
            <Row label="Build" value="2026.04" last />
          </Card>
        </div>
      </div>
    </div>
  );
}

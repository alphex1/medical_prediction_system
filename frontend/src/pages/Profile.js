import React, { useState, useEffect } from 'react';
import './Profile.css';
 
const API = process.env.REACT_APP_API_URL || "https://medicalpredictionsystem-production-6152.up.railway.app";
 
const URGENCY_COLOR = { High: '#ff4d6d', Medium: '#ffb347', Low: '#00d4aa' };
 
export default function Profile({ user, onBack, onLogout }) {
  const [history, setHistory]   = useState([]);
  const [tab, setTab]           = useState('history'); // 'history' | 'account'
  const [showConfirm, setShow]  = useState(false);
 
  useEffect(() => {
  fetch(`${API}/history/${user.email}`)
    .then(res => res.json())
    .then(data => {
      console.log("history:", data); // debug
      setHistory(data);
    })
    .catch(() => setHistory([]));
}, [user.email]);
 
  const handleDelete = async (id) => {
  await fetch(`${API}/delete/${id}`, {
    method: "DELETE"
  });
 
  // refresh history
  const res = await fetch(`${API}/history/${user.email}`);
  const data = await res.json();
  setHistory(data);
};
 
  const initials = (user.name || user.email)
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
 
  const joinDate = (() => {
    const users = JSON.parse(localStorage.getItem('medipredict_users') || '{}');
    const u = users[user.email];
    if (!u?.createdAt) return 'N/A';
    return new Date(u.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  })();
 
  return (
    <div className="prof-page">
      <div className="prof-orb prof-orb1" />
      <div className="prof-orb prof-orb2" />
 
      {/* Header */}
      <header className="prof-header">
        <button className="prof-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="prof-header-logo">
          <span style={{ color: 'var(--teal)' }}>✦</span> Disease Prediction System
        </div>
        <button className="prof-logout-btn" onClick={() => setShow(true)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </header>
 
      <div className="prof-body">
 
        {/* Hero card */}
        <div className="prof-hero scale-in">
          <div className="prof-avatar">{initials}</div>
          <div className="prof-hero-info">
            <h2 className="prof-name">{user.name || 'User'}</h2>
            <p className="prof-email">{user.email}</p>
            <div className="prof-badges">
              <span className="prof-badge prof-badge-teal">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Verified
              </span>
              <span className="prof-badge">Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
            </div>
          </div>
          <div className="prof-stats">
            <div className="prof-stat">
              <span className="prof-stat-num">{history.length}</span>
              <span className="prof-stat-label">Predictions</span>
            </div>
            <div className="prof-stat-div" />
            <div className="prof-stat">
              <span className="prof-stat-num">
                {history.length > 0
                  ? Math.round(history.reduce((a, h) => a + (h.confidence || 0), 0) / history.length) + '%'
                  : '—'}
              </span>
              <span className="prof-stat-label">Avg confidence</span>
            </div>
          </div>
        </div>
 
        {/* Tabs */}
        <div className="prof-tabs fade-up" style={{ animationDelay: '0.1s' }}>
          <button className={`prof-tab ${tab === 'history' ? 'prof-tab-active' : ''}`} onClick={() => setTab('history')}>
            Prediction History
          </button>
          <button className={`prof-tab ${tab === 'account' ? 'prof-tab-active' : ''}`} onClick={() => setTab('account')}>
            Account Info
          </button>
        </div>
 
        {/* History tab */}
        {tab === 'history' && (
          <div className="prof-section fade-up" style={{ animationDelay: '0.15s' }}>
            {history.length === 0 ? (
              <div className="prof-empty">
                <div className="prof-empty-icon">🔍</div>
                <p className="prof-empty-title">No predictions yet</p>
                <p className="prof-empty-sub">Run your first diagnosis to see results here.</p>
                <button className="prof-run-btn" onClick={onBack}>Run diagnosis</button>
              </div>
            ) : (
              <div className="prof-history">
                {history.map((h, i) => {
                  const top = h;
                  const color = '#4d9fff';
                  const date = 'Recently';
                  const time = '';
                  return (
                    <div key={h.id} className="prof-hist-card" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div className="prof-hist-top">
                        <div className="prof-hist-left">
                          <div className="prof-hist-dot" style={{ background: color }} />
                          <div>
                            <p className="prof-hist-disease">{top?.disease || 'Unknown'}</p>
                            <p className="prof-hist-date">{date} · {time}</p>
                          </div>
                        </div>
                        <div className="prof-hist-right">
                          <div className="prof-hist-conf" style={{ color }}>
                            {Math.round(top?.confidence || 0)}%
                          </div>
                          <button className="prof-hist-del" onClick={() => handleDelete(h.id)} title="Delete">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 6v3.5M7.5 6v3.5M3 3.5l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      {/* Symptoms */}
                      <p className="prof-hist-meta">
                        Symptoms: {h.symptoms ? h.symptoms.split(",").join(", ") : "None"}
                      </p>
                      {/* Alt bar */}
                      <div className="prof-hist-bar-wrap">
                        <div className="prof-hist-bar" style={{ width: `${top?.confidence || 0}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
 
        {/* Account tab */}
        {tab === 'account' && (
          <div className="prof-section fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="prof-account-card">
              <InfoRow icon={<UserIcon />} label="Full name" value={user.name || '—'} />
              <InfoRow icon={<EmailIcon />} label="Email address" value={user.email} />
              <InfoRow icon={<BirthIcon />} label="Age" value={user.age ?? '—'} />
              <InfoRow icon={<GenderIcon />} label="Gender" value={user.gender ?? '—'} />
              <InfoRow icon={<CalIcon />} label="Member since" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'} />
              <InfoRow icon={<ShieldIcon />} label="Password" value="••••••••" />
            </div>
 
            <div className="prof-danger-zone">
              <p className="prof-danger-label">Danger zone</p>
              <button className="prof-danger-btn" onClick={() => setShow(true)}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign out of account
              </button>
            </div>
          </div>
        )}
      </div>
 
      {/* Logout confirm dialog */}
      {showConfirm && (
        <div className="prof-overlay" onClick={() => setShow(false)}>
          <div className="prof-dialog scale-in" onClick={e => e.stopPropagation()}>
            <div className="prof-dialog-icon">👋</div>
            <h3 className="prof-dialog-title">Sign out?</h3>
            <p className="prof-dialog-sub">You'll need to sign in again to access MediPredict.</p>
            <div className="prof-dialog-btns">
              <button className="prof-dialog-cancel" onClick={() => setShow(false)}>Cancel</button>
              <button className="prof-dialog-confirm" onClick={onLogout}>Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
function InfoRow({ icon, label, value }) {
  return (
    <div className="prof-info-row">
      <div className="prof-info-icon">{icon}</div>
      <div>
        <p className="prof-info-label">{label}</p>
        <p className="prof-info-value">{value}</p>
      </div>
    </div>
  );
}
 
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 5.5L8 10L14 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const CalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M8 2L3 4.5V8c0 3 2.5 5 5 6 2.5-1 5-3 5-6V4.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const BirthIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="8" cy="10" r="1.2" fill="currentColor"/>
  </svg>
);
const GenderIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="10" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9 4h3v3M12 4l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

import React from 'react';
import './Landing.css';

export default function Landing({ onStart, onProfile, user }) {
  const initials = user
    ? (user.name || user.email).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div className="landing">
      <div className="land-grid" />
      <div className="land-orb land-orb1" />
      <div className="land-orb land-orb2" />

      {/* Nav */}
      <nav className="land-nav">
        <div className="land-logo">
          <span className="land-logo-mark">✦</span>
          MediPredict
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="land-badge">AI · Beta</span>
          {user && (
            <button className="land-profile-btn" onClick={onProfile} title="My profile">
              <span className="land-profile-avatar">{initials}</span>
              <span className="land-profile-name">{user.name || user.email.split('@')[0]}</span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M3 5l3.5 3.5L10 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="land-hero">
        <div className="land-eyebrow fade-up" style={{animationDelay:'0.05s'}}>
          <span className="land-dot" />
          Powered by ensemble machine learning
        </div>

        <h1 className="land-title fade-up" style={{animationDelay:'0.15s'}}>
          Know what your<br />
          <em>body is telling you</em>
        </h1>

        <p className="land-subtitle fade-up" style={{animationDelay:'0.25s'}}>
          Select your symptoms and get AI-powered predictions for
          7 diseases with confidence scores, diet advice and specialist recommendations.
        </p>

        <button className="land-cta fade-up" style={{animationDelay:'0.35s'}} onClick={onStart}>
          Start diagnosis
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <p className="land-note fade-up" style={{animationDelay:'0.40s'}}>
          Not a substitute for professional medical advice
        </p>

        <div className="land-pills fade-up" style={{animationDelay:'0.50s'}}>
          {['Diabetes','Heart Disease','Malaria','Typhoid','Dengue','Pneumonia','Jaundice','+ Healthy'].map(d => (
            <span key={d} className={`land-pill ${d === '+ Healthy' ? 'land-pill-green' : ''}`}>{d}</span>
          ))}
        </div>

        <div className="land-stats fade-up" style={{animationDelay:'0.60s'}}>
          <div className="land-stat">
            <span className="land-stat-num">95.3%</span>
            <span className="land-stat-label">Test accuracy</span>
          </div>
          <div className="land-stat-divider" />
          <div className="land-stat">
            <span className="land-stat-num">20</span>
            <span className="land-stat-label">Symptoms tracked</span>
          </div>
          <div className="land-stat-divider" />
          <div className="land-stat">
            <span className="land-stat-num">8</span>
            <span className="land-stat-label">Conditions detected</span>
          </div>
          <div className="land-stat-divider" />
          <div className="land-stat">
            <span className="land-stat-num">3</span>
            <span className="land-stat-label">ML models combined</span>
          </div>
        </div>
      </main>
    </div>
  );
}

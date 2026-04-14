import React, { useState } from 'react';
import './Predictor.css';

/**
 * Symptom list — keys match model_meta.json exactly (order doesn't matter for UI,
 * the backend builds the feature vector in the correct training order).
 */
const GROUPS = {
  'General': [
    { key: 'fever',           label: 'Fever' },
    { key: 'fatigue',         label: 'Fatigue' },
    { key: 'chills',          label: 'Chills' },
    { key: 'sweating',        label: 'Sweating' },
    { key: 'weight_loss',     label: 'Weight Loss' },
    { key: 'loss_of_appetite',label: 'Loss of Appetite' },
    { key: 'nausea',          label: 'Nausea' },
    { key: 'vomiting',        label: 'Vomiting' },
  ],
  'Head & Senses': [
    { key: 'headache',            label: 'Headache' },
    { key: 'blurred_vision',      label: 'Blurred Vision' },
    { key: 'loss_of_taste_smell', label: 'Loss of Taste / Smell' },
  ],
  'Chest & Breathing': [
    { key: 'chest_pain',          label: 'Chest Pain' },
    { key: 'shortness_of_breath', label: 'Shortness of Breath' },
    { key: 'cough',               label: 'Cough' },
  ],
  'Body & Skin': [
    { key: 'joint_pain',               label: 'Joint Pain' },
    { key: 'muscle_pain',              label: 'Muscle Pain' },
    { key: 'skin_rash',                label: 'Skin Rash' },
    { key: 'yellowing_of_skin_eyes',   label: 'Yellowing of Skin / Eyes' },
    { key: 'abdominal_pain',           label: 'Abdominal Pain' },
  ],
  'Metabolic / Urinary': [
    { key: 'frequent_urination', label: 'Frequent Urination' },
  ],
};

// Flat list (all 20, deduplicated) for "All" tab and search
const ALL = Object.values(GROUPS).flat();
const TABS = ['All', ...Object.keys(GROUPS)];

export default function Predictor({ onResults, onBack, user }) {
  const [selected, setSelected] = useState(new Set());
  const [tab, setTab]           = useState('All');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const toggle = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const getSymptoms = () => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return ALL.filter(s => s.label.toLowerCase().includes(q) || s.key.includes(q));
    }
    return tab === 'All' ? ALL : (GROUPS[tab] || []);
  };

  const predict = async () => {
    if (selected.size === 0) { setError('Please select at least one symptom.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: Array.from(selected), user_email: user.email }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.detail || `Server error (${res.status})`);
      }
      const data = await res.json();
      onResults(data);
    } catch (e) {
      setError(e.message || 'Could not connect to server. Is the backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  const symptoms = getSymptoms();

  return (
    <div className="pred-page">
      <div className="pred-orb pred-orb1" />
      <div className="pred-orb pred-orb2" />

      {/* Header */}
      <header className="pred-header">
        <button className="pred-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="pred-header-center">
          <span className="pred-logo-mark">✦</span>
          <span>MediPredict</span>
        </div>
        <div className="pred-count-badge">
          {selected.size} / 20 selected
        </div>
      </header>

      <div className="pred-body">
        <div className="pred-top fade-up">
          <h2 className="pred-title">Select your symptoms</h2>
          <p className="pred-sub">Choose everything you are currently experiencing. You can select multiple.</p>
        </div>

        {/* Search */}
        <div className="pred-search-wrap fade-up" style={{ animationDelay: '0.05s' }}>
          <svg className="pred-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            className="pred-search"
            type="text"
            placeholder="Search symptoms…"
            value={search}
            onChange={e => { setSearch(e.target.value); setTab('All'); }}
          />
          {search && (
            <button className="pred-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Tabs */}
        {!search && (
          <div className="pred-tabs fade-up" style={{ animationDelay: '0.1s' }}>
            {TABS.map(t => (
              <button
                key={t}
                className={`pred-tab ${tab === t ? 'pred-tab-active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
                {t !== 'All' && (
                  <span style={{
                    marginLeft: 4,
                    fontSize: 10,
                    opacity: 0.6,
                  }}>
                    ({GROUPS[t]?.filter(s => selected.has(s.key)).length || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Symptom chips */}
        <div className="pred-grid fade-up" style={{ animationDelay: '0.15s' }}>
          {symptoms.length === 0 && (
            <p className="pred-empty">No symptoms match "{search}"</p>
          )}
          {symptoms.map(s => (
            <button
              key={s.key}
              className={`pred-chip ${selected.has(s.key) ? 'pred-chip-active' : ''}`}
              onClick={() => toggle(s.key)}
            >
              {selected.has(s.key) && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5L5.5 9.5L10.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {s.label}
            </button>
          ))}
        </div>

        {/* Selected preview */}
        {selected.size > 0 && (
          <div className="pred-selected-wrap fade-in">
            <p className="pred-selected-label">Selected symptoms:</p>
            <div className="pred-selected-list">
              {Array.from(selected).map(k => {
                const sym = ALL.find(s => s.key === k);
                return (
                  <span key={k} className="pred-selected-pill">
                    {sym?.label || k}
                    <button onClick={() => toggle(k)}>✕</button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="pred-error">{error}</p>}
      </div>

      {/* Bottom bar */}
      <div className="pred-footer">
        <div className="pred-footer-info">
          <span className="pred-footer-count">{selected.size}</span>
          <span className="pred-footer-label">
            {selected.size === 1 ? 'symptom selected' : 'symptoms selected'}
          </span>
        </div>
        <button
          className={`pred-predict-btn ${selected.size === 0 || loading ? 'pred-btn-disabled' : ''}`}
          onClick={predict}
          disabled={selected.size === 0 || loading}
        >
          {loading ? (
            <><span className="pred-spinner" /> Analysing…</>
          ) : (
            <>
              Get prediction
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
